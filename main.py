# -*- coding: utf-8 -*-
"""PhaseGuard FastAPI AI Backend
Integrates trained Praxis 3-Phase Current Model, IsolationForest Anomaly Detector,
and PowerZoo AEMO Grid-Demand Forecaster.
"""

import os, sys, warnings, json
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Check model artifact location (local or colab)
MODEL_PATH = os.path.join(MODELS_DIR, "phaseguard_models.joblib")
if not os.path.exists(MODEL_PATH) and os.path.exists("/content/phaseguard_models.joblib"):
    MODEL_PATH = "/content/phaseguard_models.joblib"

SAMPLE_CSV_PATH = os.path.join(MODELS_DIR, "phaseguard_sample_history.csv")
if not os.path.exists(SAMPLE_CSV_PATH) and os.path.exists("/content/phaseguard_sample_history.csv"):
    SAMPLE_CSV_PATH = "/content/phaseguard_sample_history.csv"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model artifacts not found at {MODEL_PATH}. Please run train_and_cache.py first.")

# Load models and metadata
print(f"Loading PhaseGuard models from {MODEL_PATH}...")
artifacts = joblib.load(MODEL_PATH)

phase_model = artifacts["phase_model"]
anomaly_model = artifacts["anomaly_model"]
FEATURE_COLUMNS = artifacts["feature_columns"]
BASE_FEATURES = artifacts["base_features"]
ANOMALY_COLUMNS = artifacts["anomaly_columns"]
phase_mae = artifacts["phase_validation_mae_amperes"]
training_rows = artifacts.get("training_rows", 3456)
powerzoo_model = artifacts.get("powerzoo_model")
powerzoo_features = artifacts.get("powerzoo_features", [])
powerzoo_status = artifacts.get("powerzoo_status", {"loaded": False, "reason": "Not initialized"})

# Load sample historical readings
if os.path.exists(SAMPLE_CSV_PATH):
    sample_history_df = pd.read_csv(SAMPLE_CSV_PATH)
else:
    sample_history_df = pd.DataFrame()

# Precompute medians for imputation
BASE_MEDIANS = artifacts.get("base_medians")
if BASE_MEDIANS is None and not sample_history_df.empty:
    BASE_MEDIANS = sample_history_df[BASE_FEATURES].median(numeric_only=True).to_dict()
elif BASE_MEDIANS is None:
    BASE_MEDIANS = {}

ANOM_MEDIANS = artifacts.get("anom_medians")
if ANOM_MEDIANS is None and not sample_history_df.empty:
    ANOM_MEDIANS = sample_history_df[ANOMALY_COLUMNS].median(numeric_only=True).to_dict()
elif ANOM_MEDIANS is None:
    ANOM_MEDIANS = {}

PHASES = ["Phase1_Current", "Phase2_Current", "Phase3_Current"]
VOLTAGES = ["Phase1_Voltage", "Phase2_Voltage", "Phase3_Voltage"]

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

def calc_imbalance(values):
    values = np.asarray(values, dtype=float)
    avg = float(np.mean(values))
    if avg <= 1e-9:
        return 0.0
    return float(np.max(np.abs(values - avg)) / avg * 100.0)

def get_risk(imbalance, anomaly):
    if imbalance >= 10 or anomaly:
        return "HIGH"
    if imbalance >= 5:
        return "MEDIUM"
    return "LOW"

def get_recommendation(currents, imbalance):
    names = ["R", "Y", "B"]
    currents = np.asarray(currents, dtype=float)
    if imbalance < 5:
        return "Phase currents appear reasonably balanced. Continue monitoring."
    high = names[int(np.argmax(currents))]
    low = names[int(np.argmin(currents))]
    return (
        f"{high} phase has the highest predicted current and {low} phase the lowest. "
        f"Ask a qualified electrical engineer to assess whether a suitable non-critical "
        f"load can be redistributed from {high} to {low}. Verify protection, cable, "
        f"neutral and equipment ratings before any switching."
    )

def predict_from_history(history_df):
    h = history_df.copy()
    for col in BASE_FEATURES:
        if col not in h.columns:
            h[col] = np.nan
        h[col] = pd.to_numeric(h[col], errors="coerce")
        h[col] = h[col].fillna(BASE_MEDIANS.get(col, 0.0))
    if len(h) < 31:
        raise ValueError("Provide at least 31 consecutive one-minute readings.")
    fx = build_phase_features(h[BASE_FEATURES])
    last_x = fx.iloc[[-1]].reindex(columns=FEATURE_COLUMNS)
    last_x = last_x.fillna(pd.Series(BASE_MEDIANS, dtype=float).reindex(last_x.columns).fillna(0))
    forecast = phase_model.predict(last_x)[0].astype(float).tolist()
    current = [float(h.iloc[-1][c]) for c in PHASES]

    latest = h.iloc[-1]
    anomaly_values = {
        c: float(latest[c]) if c in h.columns and pd.notna(latest[c])
        else float(ANOM_MEDIANS.get(c, 0.0))
        for c in ANOMALY_COLUMNS
    }
    anomaly_input = pd.DataFrame([anomaly_values], columns=ANOMALY_COLUMNS)
    anomaly = bool(anomaly_model.predict(anomaly_input)[0] == -1)

    now_imb = calc_imbalance(current)
    future_imb = calc_imbalance(forecast)
    risk = get_risk(max(now_imb, future_imb), anomaly)

    return {
        "forecast_horizon_minutes": 30,
        "current": {"R": current[0], "Y": current[1], "B": current[2]},
        "forecast": {"R": forecast[0], "Y": forecast[1], "B": forecast[2]},
        "imbalance_percent": round(now_imb, 2),
        "predicted_imbalance_percent": round(future_imb, 2),
        "anomaly_detected": anomaly,
        "risk_level": risk,
        "recommendation": get_recommendation(forecast, future_imb),
        "validation_mae_amperes": {
            "R": phase_mae[0], "Y": phase_mae[1], "B": phase_mae[2]
        },
        "disclaimer": "Prototype decision support only; not a certified protection or control system."
    }

# Pydantic models matching exact schema
class Reading(BaseModel):
    Timestamp: Optional[str] = None
    Phase1_Current: float
    Phase2_Current: float
    Phase3_Current: float
    Phase1_Voltage: float
    Phase2_Voltage: float
    Phase3_Voltage: float
    Active_Power: Optional[float] = None
    Reactive_Power: Optional[float] = None
    Power_Factor: Optional[float] = None
    Frequency: Optional[float] = None
    Stator_Temperature: Optional[float] = None
    Bearing_Temperature: Optional[float] = None
    Ambient_Temperature: Optional[float] = None
    Current_Unbalance: Optional[float] = None
    THD_Current: Optional[float] = None
    Vibration_X: Optional[float] = None
    Vibration_Y: Optional[float] = None
    Vibration_Z: Optional[float] = None
    Motor_Speed: Optional[float] = None
    Torque: Optional[float] = None
    Failure_Code: Optional[float] = None

class PredictRequest(BaseModel):
    history: List[Reading]

class DemandRequest(BaseModel):
    history: List[float]  # at least 12 consecutive 5-minute demand values

# FastAPI App
app = FastAPI(title="PhaseGuard AI Backend", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

@app.get("/")
def root():
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "project": "PhaseGuard",
        "status": "online",
        "tagline": "Predict the Imbalance. Prevent the Failure.",
        "description": "AI-powered three-phase electrical monitoring and forecasting system",
        "endpoints": [
            "/health",
            "/model-info",
            "/demo",
            "/predict",
            "/powerzoo-info",
            "/powerzoo-forecast",
            "/history"
        ]
    }

@app.get("/api")
def api_root():
    return {
        "project": "PhaseGuard",
        "status": "online",
        "tagline": "Predict the Imbalance. Prevent the Failure.",
        "description": "AI-powered three-phase electrical monitoring and forecasting system",
        "endpoints": [
            "/health",
            "/model-info",
            "/demo",
            "/predict",
            "/powerzoo-info",
            "/powerzoo-forecast",
            "/history"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "phase_model_loaded": phase_model is not None,
        "anomaly_model_loaded": anomaly_model is not None,
        "powerzoo_model_loaded": powerzoo_model is not None
    }

@app.get("/model-info")
def model_info():
    return {
        "phase_model": "RandomForestRegressor",
        "anomaly_model": "IsolationForest",
        "forecast_horizon_minutes": 30,
        "phase_order": ["R", "Y", "B"],
        "phase_validation_mae_amperes": {
            "R": phase_mae[0],
            "Y": phase_mae[1],
            "B": phase_mae[2]
        },
        "praxis_training_rows": int(training_rows),
        "powerzoo": powerzoo_status
    }

@app.get("/demo")
def demo():
    if sample_history_df.empty:
        raise HTTPException(status_code=500, detail="Sample history dataset is unavailable.")
    sample = sample_history_df.tail(80).copy()
    result = predict_from_history(sample)
    result["demo_mode"] = True
    result["data_source"] = "Praxis historical dataset sample; not live sensor data"
    return result

@app.post("/predict")
def predict_endpoint(request: PredictRequest):
    if len(request.history) < 31:
        raise HTTPException(status_code=422, detail="At least 31 one-minute readings are required.")
    rows = []
    for item in request.history:
        rows.append(item.dict() if hasattr(item, "dict") else item.model_dump())
    try:
        result = predict_from_history(pd.DataFrame(rows))
        result["demo_mode"] = False
        result["data_source"] = "Client-supplied readings"
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

@app.get("/powerzoo-info")
def powerzoo_info():
    return powerzoo_status

@app.post("/powerzoo-forecast")
def powerzoo_forecast(request: DemandRequest):
    if powerzoo_model is None:
        raise HTTPException(status_code=503, detail="PowerZoo demand model was not trained. Check /powerzoo-info.")
    values = [float(v) for v in request.history]
    if len(values) < 12:
        raise HTTPException(status_code=422, detail="Send at least 12 consecutive 5-minute demand values.")
    d = pd.Series(values)
    row = {}
    for lag in [1, 2, 3, 6, 12]:
        row[f"demand_lag_{lag}"] = float(d.iloc[-lag])
    row["demand_roll_3"] = float(d.tail(3).mean())
    row["demand_roll_6"] = float(d.tail(6).mean())
    row["demand_roll_12"] = float(d.tail(12).mean())
    pred = float(powerzoo_model.predict(pd.DataFrame([row], columns=powerzoo_features))[0])
    return {
        "forecast_horizon_minutes": 30,
        "predicted_grid_demand": pred,
        "unit": "dataset demand unit (MW in source)",
        "region": powerzoo_status.get("region"),
        "model": "ExtraTreesRegressor"
    }

@app.get("/history")
def get_history(limit: int = 100):
    """Returns real historical telemetry records from the Praxis dataset."""
    if sample_history_df.empty:
        return {"readings": []}
    subset = sample_history_df.tail(limit).copy()
    # Fill NaNs with sensible defaults
    subset = subset.fillna({
        "Frequency": 50.0,
        "Power_Factor": 0.88,
        "Active_Power": 45.2,
        "Reactive_Power": 15.1,
        "Stator_Temperature": 42.0,
        "Bearing_Temperature": 45.0,
        "Ambient_Temperature": 28.0,
        "THD_Current": 3.2,
        "Current_Unbalance": 1.5,
        "Failure_Code": 0
    })
    records = subset.to_dict(orient="records")
    return {
        "count": len(records),
        "data_source": "Praxis Crompton Greaves real three-phase historical dataset",
        "readings": records
    }

# Mount Frontend Assets & SPA Routing
assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/splash-hero.jpg")
def splash_hero():
    hero_path = os.path.join(FRONTEND_DIST, "splash-hero.jpg")
    if not os.path.exists(hero_path):
        hero_path = os.path.join(BASE_DIR, "..", "frontend", "public", "splash-hero.jpg")
    if os.path.exists(hero_path):
        return FileResponse(hero_path)
    raise HTTPException(status_code=404, detail="Hero image not found")

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

