import os, sys, warnings, json
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
from datasets import load_dataset
from sklearn.ensemble import RandomForestRegressor, IsolationForest, ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error

np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "phaseguard_models.joblib")
SAMPLE_CSV_PATH = os.path.join(MODELS_DIR, "phaseguard_sample_history.csv")

print("PHASEGUARD 1/5: Loading Praxis three-phase dataset...")
praxis = load_dataset(
    "narteybrown/praxis-crompton-greeves",
    split="train"
).to_pandas()

required = [
    "Timestamp", "Phase1_Current", "Phase2_Current", "Phase3_Current",
    "Phase1_Voltage", "Phase2_Voltage", "Phase3_Voltage"
]
missing = [c for c in required if c not in praxis.columns]
if missing:
    raise ValueError("Praxis dataset schema changed; missing columns: " + str(missing))

try:
    praxis["Timestamp"] = pd.to_datetime(
        praxis["Timestamp"], format="mixed", dayfirst=True, errors="coerce"
    )
except Exception:
    praxis["Timestamp"] = pd.to_datetime(
        praxis["Timestamp"], dayfirst=True, errors="coerce"
    )

if "unit_id" in praxis.columns and praxis["unit_id"].nunique() > 1:
    praxis = praxis[praxis["unit_id"] == praxis["unit_id"].iloc[0]].copy()

praxis = praxis.dropna(subset=["Timestamp"]).copy()
praxis["Timestamp"] = praxis["Timestamp"].dt.floor("min")

candidate_cols = [
    "Phase1_Current", "Phase2_Current", "Phase3_Current",
    "Phase1_Voltage", "Phase2_Voltage", "Phase3_Voltage",
    "Active_Power", "Reactive_Power", "Power_Factor", "Frequency",
    "Stator_Temperature", "Bearing_Temperature", "Ambient_Temperature",
    "Current_Unbalance", "THD_Current", "Failure_Code",
    "Vibration_X", "Vibration_Y", "Vibration_Z", "Motor_Speed", "Torque"
]
available_cols = [c for c in candidate_cols if c in praxis.columns]
for c in available_cols:
    praxis[c] = pd.to_numeric(praxis[c], errors="coerce")

minute = (
    praxis.groupby("Timestamp", as_index=False)[available_cols]
    .mean()
    .sort_values("Timestamp")
    .reset_index(drop=True)
)
minute[available_cols] = minute[available_cols].interpolate(limit=5).ffill().bfill()
minute = minute.dropna(subset=[
    "Phase1_Current", "Phase2_Current", "Phase3_Current",
    "Phase1_Voltage", "Phase2_Voltage", "Phase3_Voltage"
]).reset_index(drop=True)

print("Praxis processed minute rows:", len(minute))

# 2. PowerZoo AEMO demand
print("PHASEGUARD 2/5: Training PowerZoo grid-demand model...")
powerzoo_model = None
powerzoo_features = []
powerzoo_mae = None
powerzoo_status = {"loaded": False, "reason": None}

try:
    pz = load_dataset(
        "PowerZooJax/PowerZooDataset",
        "aemo_5min_demand",
        split="train"
    ).to_pandas()

    if {"INTERVAL_DATETIME", "OPERATIONAL_DEMAND"}.issubset(pz.columns):
        pz["INTERVAL_DATETIME"] = pd.to_datetime(pz["INTERVAL_DATETIME"], errors="coerce", utc=True)
        pz["OPERATIONAL_DEMAND"] = pd.to_numeric(pz["OPERATIONAL_DEMAND"], errors="coerce")
        pz = pz.dropna(subset=["INTERVAL_DATETIME", "OPERATIONAL_DEMAND"])

        if "REGIONID" in pz.columns:
            region = pz["REGIONID"].value_counts().index[0]
            pz = pz[pz["REGIONID"] == region].copy()
        else:
            region = "unknown"

        pz = pz.sort_values("INTERVAL_DATETIME").drop_duplicates(
            "INTERVAL_DATETIME"
        ).reset_index(drop=True)

        if len(pz) > 180000:
            pz = pz.tail(180000).reset_index(drop=True)

        demand = pz["OPERATIONAL_DEMAND"].astype(float)
        pz_x = pd.DataFrame(index=pz.index)
        for lag in [1, 2, 3, 6, 12]:
            pz_x[f"demand_lag_{lag}"] = demand.shift(lag)
        pz_x["demand_roll_3"] = demand.rolling(3).mean()
        pz_x["demand_roll_6"] = demand.rolling(6).mean()
        pz_x["demand_roll_12"] = demand.rolling(12).mean()
        pz_y = demand.shift(-6)
        pz_data = pz_x.copy()
        pz_data["target"] = pz_y
        pz_data = pz_data.replace([np.inf, -np.inf], np.nan).dropna()

        if len(pz_data) >= 100:
            pz_split = int(len(pz_data) * 0.8)
            pz_model = ExtraTreesRegressor(
                n_estimators=100, max_depth=18, min_samples_leaf=2,
                n_jobs=-1, random_state=42
            )
            pz_model.fit(
                pz_data.drop(columns=["target"]).iloc[:pz_split],
                pz_data["target"].iloc[:pz_split]
            )
            pz_pred = pz_model.predict(pz_data.drop(columns=["target"]).iloc[pz_split:])
            powerzoo_mae = float(mean_absolute_error(
                pz_data["target"].iloc[pz_split:], pz_pred
            )) if len(pz_data) > pz_split else None

            powerzoo_model = pz_model
            powerzoo_features = list(pz_data.drop(columns=["target"]).columns)
            powerzoo_status = {
                "loaded": True,
                "dataset": "PowerZooJax/PowerZooDataset",
                "subset": "aemo_5min_demand",
                "region": str(region),
                "training_rows": int(pz_split),
                "validation_mae": powerzoo_mae,
                "forecast_horizon_minutes": 30,
                "unit": "dataset demand unit (MW in source)"
            }
            print("PowerZoo model trained successfully for region:", region, "MAE:", powerzoo_mae)
except Exception as e:
    powerzoo_status["reason"] = str(e)[:400]
    print("PowerZoo note:", str(e)[:250])

# 3. Train Praxis R/Y/B current forecast model
print("PHASEGUARD 3/5: Engineering features and training phase model...")
PHASES = ["Phase1_Current", "Phase2_Current", "Phase3_Current"]
VOLTAGES = ["Phase1_Voltage", "Phase2_Voltage", "Phase3_Voltage"]

BASE_FEATURES = [
    c for c in [
        *PHASES, *VOLTAGES, "Active_Power", "Reactive_Power",
        "Power_Factor", "Frequency", "Stator_Temperature",
        "Bearing_Temperature", "Ambient_Temperature",
        "Current_Unbalance", "THD_Current", "Vibration_X",
        "Vibration_Y", "Vibration_Z", "Motor_Speed", "Torque"
    ] if c in minute.columns
]

def build_phase_features(frame):
    frame = frame.copy().reset_index(drop=True)
    out = pd.DataFrame(index=frame.index)
    for col in BASE_FEATURES:
        s = pd.to_numeric(frame[col], errors="coerce")
        out[col + "_now"] = s
        if col in PHASES:
            for lag in [1, 5, 15, 30]:
                out[f"{col}_lag_{lag}"] = s.shift(lag)
            for window in [5, 15, 30]:
                out[f"{col}_mean_{window}"] = s.rolling(window).mean()
                out[f"{col}_std_{window}"] = s.rolling(window).std()
    return out.replace([np.inf, -np.inf], np.nan)

X_all = build_phase_features(minute[BASE_FEATURES])
Y_all = minute[PHASES].shift(-30)
train_table = X_all.copy()
for i, col in enumerate(PHASES):
    train_table["target_" + col] = Y_all[col]
train_table = train_table.replace([np.inf, -np.inf], np.nan).dropna().reset_index(drop=True)

FEATURE_COLUMNS = [c for c in train_table.columns if not c.startswith("target_")]
TARGET_COLUMNS = ["target_" + c for c in PHASES]
X = train_table[FEATURE_COLUMNS]
Y = train_table[TARGET_COLUMNS]

cut = int(len(train_table) * 0.80)
X_train, X_test = X.iloc[:cut], X.iloc[cut:]
Y_train, Y_test = Y.iloc[:cut], Y.iloc[cut:]

phase_model = RandomForestRegressor(
    n_estimators=120,
    max_depth=16,
    min_samples_leaf=2,
    max_features=0.9,
    n_jobs=-1,
    random_state=42
)
phase_model.fit(X_train, Y_train)

if len(X_test):
    phase_predictions = phase_model.predict(X_test)
    phase_mae = mean_absolute_error(Y_test, phase_predictions, multioutput="raw_values")
    phase_mae = [float(x) for x in phase_mae]
else:
    phase_mae = [None, None, None]

print("Praxis Phase model MAE (R, Y, B Amperes):", phase_mae)

# 4. Train Anomaly detector
print("PHASEGUARD 4/5: Training anomaly detector...")
ANOMALY_COLUMNS = [
    c for c in [
        *PHASES, *VOLTAGES, "Frequency", "Power_Factor",
        "Stator_Temperature", "Bearing_Temperature",
        "THD_Current", "Current_Unbalance", "Failure_Code"
    ] if c in minute.columns
]
anom_train = minute[ANOMALY_COLUMNS].replace([np.inf, -np.inf], np.nan)
anom_train = anom_train.interpolate(limit_direction="both").ffill().bfill()
anomaly_model = IsolationForest(
    n_estimators=150, contamination=0.04,
    random_state=42, n_jobs=-1
)
anomaly_model.fit(anom_train)

# 5. Save artifacts
print("PHASEGUARD 5/5: Saving model artifacts...")
BASE_MEDIANS = minute[BASE_FEATURES].median(numeric_only=True).to_dict()
ANOM_MEDIANS = minute[ANOMALY_COLUMNS].median(numeric_only=True).to_dict()

artifact = {
    "phase_model": phase_model,
    "anomaly_model": anomaly_model,
    "feature_columns": FEATURE_COLUMNS,
    "base_features": BASE_FEATURES,
    "anomaly_columns": ANOMALY_COLUMNS,
    "base_medians": BASE_MEDIANS,
    "anom_medians": ANOM_MEDIANS,
    "phase_validation_mae_amperes": phase_mae,
    "training_rows": int(len(X_train)),
    "powerzoo_model": powerzoo_model,
    "powerzoo_features": powerzoo_features,
    "powerzoo_status": powerzoo_status
}

joblib.dump(artifact, MODEL_PATH)
minute.tail(300).to_csv(SAMPLE_CSV_PATH, index=False)

print(f"Artifacts successfully saved to:")
print(f"  {MODEL_PATH}")
print(f"  {SAMPLE_CSV_PATH}")

