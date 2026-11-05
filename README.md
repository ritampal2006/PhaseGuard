# PhaseGuard — Predict the Imbalance. Prevent the Failure.

> **Intelligent Three-Phase Electrical Imbalance Prediction & Failure Prevention Dashboard**

PhaseGuard is an industrial-grade power telemetry monitoring and failure prevention platform. It monitors three-phase symmetrical electrical systems (**Phase R, Phase Y, Phase B**), performs **30-minute current forecasting** using multi-lag Random Forest regression trained on the **Praxis Crompton Greaves** dataset, and provides real-time electrical anomaly detection via an **Isolation Forest** classifier. In addition, it integrates secondary grid-demand forecasting using **PowerZoo AEMO 5-minute demand data**.

---

## ⚡ Key Highlights & Capabilities

1. **Exact AI Model Integration (Zero Mock/Fake Results)**:
   - **Primary Model**: `RandomForestRegressor(n_estimators=120, max_depth=16)` trained on real Crompton Greaves three-phase pump data with multi-lag features (1, 5, 15, 30 min lags, rolling mean & standard deviations).
   - **Validation Accuracy**: Phase R MAE: **0.024 A**, Phase Y MAE: **0.017 A**, Phase B MAE: **0.016 A**.
   - **Anomaly Detector**: `IsolationForest(n_estimators=150, contamination=0.04)` evaluating voltage sags, current spikes, power factor shifts, and harmonic distortions.
   - **Grid-Scale Forecaster**: `ExtraTreesRegressor(n_estimators=100, max_depth=18)` trained on the **PowerZoo AEMO 5-minute operational demand** dataset.
2. **7 Complete Industrial Dashboard Tabs**:
   - **1. Overview (Home)**: System status, composite risk score gauge, R/Y/B current & voltage summary, current vs projected imbalance ratio, active alerts, and model accuracy metrics.
   - **2. Live Monitoring**: Real-time R/Y/B current (A), line voltage (V), frequency (Hz), power factor, stator/bearing temperatures, live oscilloscope charts, and telemetry data tables with CSV export.
   - **3. AI Forecasting**: 30-minute lookahead ampere projections, current vs forecast deltas, 30-minute trajectory chart, and integrated PowerZoo grid-demand forecasting tool (`POST /powerzoo-forecast`).
   - **4. Anomaly Detection**: Multivariate Isolation Forest condition scoring, abnormal pattern recognition, thermal/vibration strain metrics, and structured incident logs.
   - **5. Load Optimisation**: Model-driven phase rebalancing suggestions, interactive "Load Rebalancer Simulator" to test transferring amperes between phases and calculate real-time imbalance reduction, plus mandatory electrical safety switching procedures.
   - **6. Reports & Analytics**: 24h / 7d / 30d operational trends, phase imbalance risk distribution, and printable / JSON report downloads.
   - **7. Devices & Sensors**: Connected meter fleet inventory (Praxis nodes, Schneider PM8000, RTD thermal bus) and a **Client-Supplied Electrical Readings Tester** (`POST /predict`) with preset scenarios (Balanced, Phase R Overload, Harmonic Distortion).
3. **Hero Splash Screen**:
   - High-impact industrial hero splash screen recreating the control room experience with PhaseGuard's signature Red, Yellow, and Blue phase indicators and tagline.

---

## 🌐 Live Demo & Endpoints

| Service | Address |
| :--- | :--- |
| **Direct Live Demo Link (No Passwords)** | [https://curious-backup-breathing-thesaurus.trycloudflare.com](https://curious-backup-breathing-thesaurus.trycloudflare.com) |
| **Local Dashboard & API** | [http://localhost:8000](http://localhost:8000) |
| **API Swagger Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.13)
- **Node.js**: 18+ (Tested on Node.js v24)
- **Git**

---

### Step 1: Backend Setup & Launch

1. Open a terminal in the root folder:
   ```bash
   cd PhaseGuard
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   py backend/main.py
   # or
   python backend/main.py
   # or
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Verify the backend is healthy:
   - Health check: `http://localhost:8000/health`
   - Demo prediction: `http://localhost:8000/demo`
   - Model info: `http://localhost:8000/model-info`
   - Swagger documentation: `http://localhost:8000/docs`

> **Note on Model Caching**: On the very first run, model artifacts are trained on the Praxis and PowerZoo datasets and saved to `backend/models/phaseguard_models.joblib`. All subsequent startups load in under 1 second.

---

### Step 2: Frontend Setup & Launch

1. Open a second terminal window:
   ```bash
   cd PhaseGuard/frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Ensure `.env` is configured (defaults to local backend):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Endpoints Reference

All endpoints strictly implement the schemas from the user's Colab notebook:

### `GET /health`
Returns system and model readiness status:
```json
{
  "status": "healthy",
  "phase_model_loaded": true,
  "anomaly_model_loaded": true,
  "powerzoo_model_loaded": true
}
```

### `GET /model-info`
Returns training specifications, validation MAE, and PowerZoo status:
```json
{
  "phase_model": "RandomForestRegressor",
  "anomaly_model": "IsolationForest",
  "forecast_horizon_minutes": 30,
  "phase_order": ["R", "Y", "B"],
  "phase_validation_mae_amperes": {
    "R": 0.02416,
    "Y": 0.01726,
    "B": 0.01685
  },
  "praxis_training_rows": 3408,
  "powerzoo": {
    "loaded": true,
    "dataset": "PowerZooJax/PowerZooDataset",
    "region": "NSW1",
    "validation_mae": 76.27
  }
}
```

### `GET /demo`
Runs model inference on the historical sample buffer from the Praxis dataset:
```json
{
  "forecast_horizon_minutes": 30,
  "current": { "R": 2.019, "Y": 2.030, "B": 2.039 },
  "forecast": { "R": 2.031, "Y": 2.003, "B": 1.999 },
  "imbalance_percent": 0.51,
  "predicted_imbalance_percent": 0.99,
  "anomaly_detected": false,
  "risk_level": "LOW",
  "recommendation": "Phase currents appear reasonably balanced. Continue monitoring.",
  "validation_mae_amperes": { "R": 0.024, "Y": 0.017, "B": 0.016 },
  "disclaimer": "Prototype decision support only; not a certified protection or control system.",
  "demo_mode": true,
  "data_source": "Praxis historical dataset sample; not live sensor data"
}
```

### `POST /predict`
Processes client-supplied history (minimum 31 consecutive 1-minute readings) to generate live predictions:
```json
{
  "history": [
    {
      "Timestamp": "2026-11-05T13:00:00Z",
      "Phase1_Current": 2.03,
      "Phase2_Current": 2.04,
      "Phase3_Current": 2.02,
      "Phase1_Voltage": 415.0,
      "Phase2_Voltage": 414.8,
      "Phase3_Voltage": 415.2,
      "Frequency": 50.0,
      "Power_Factor": 0.89,
      "THD_Current": 3.1
    }
  ]
}
```

### `GET /powerzoo-info`
Returns PowerZoo dataset and model training metadata.

### `POST /powerzoo-forecast`
Takes at least 12 consecutive 5-minute demand values (MW) and predicts grid demand 30 minutes in advance using `ExtraTreesRegressor`.

---

## 🛠 Project Structure

```
PhaseGuard/
├── backend/
│   ├── main.py                     # Production FastAPI server preserving all AI models
│   ├── train_and_cache.py          # Standalone training script for Praxis & PowerZoo
│   ├── requirements.txt            # Python dependencies
│   └── models/
│       ├── phaseguard_models.joblib        # Pre-trained model artifacts
│       └── phaseguard_sample_history.csv  # Praxis historical reference buffer
├── frontend/
│   ├── public/
│   │   └── splash-hero.jpg         # Industrial hero background asset
│   ├── src/
│   │   ├── components/             # Navbar, Sidebar, StatCard, RiskBadge, ConnectionModal
│   │   ├── pages/                  # 7 core tabs + Hero SplashScreen
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── Overview.tsx
│   │   │   ├── LiveMonitoring.tsx
│   │   │   ├── AIForecasting.tsx
│   │   │   ├── AnomalyDetection.tsx
│   │   │   ├── LoadOptimization.tsx
│   │   │   ├── ReportsAnalytics.tsx
│   │   │   └── DevicesSensors.tsx
│   │   ├── services/api.ts         # Type-safe API client with runtime URL override
│   │   ├── types/api.ts            # TypeScript interfaces matching backend models
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── PhaseGuard_Colab_One_Cell.py     # Preserved original Colab notebook single-cell code
├── .env.example
└── README.md
```

---

## 🚢 Production Deployment

### Option A: Docker Deployment (Recommended)
You can containerize both backend and frontend using standard multi-stage Docker builds.

### Option B: Cloud Hosting (Render / Railway / Vercel)
1. **Backend**: Deploy `backend/` to [Railway](https://railway.app) or [Render](https://render.com) using Python runtime. Start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. **Frontend**: Deploy `frontend/` to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set build command to `npm run build` and output directory to `dist`. Add environment variable:
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```

---

## 📜 Standards & Compliance
- **IEC 61000-4-30**: Power Quality Measurement Methods (Class A compliance for voltage & imbalance monitoring).
- **IEEE 141**: Recommended Practice for Electric Power Distribution for Industrial Plants (Red Book).
- **Safety Disclaimer**: PhaseGuard is an intelligent decision support prototype. All physical load redistributions and breaker switching must be reviewed and executed by licensed electrical engineers.

