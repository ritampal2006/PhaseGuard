# PhaseGuard
# ⚡ PhaseGuard – Predict the Imbalance. Prevent the Failure.

<p align="center">
  <b>AI-Powered Three-Phase Electrical Monitoring & Predictive Analytics Platform</b>
</p>

<p align="center">
  <a href="https://phaseguard-69e18.web.app/"><b>🌐 Live Demo</b></a> •
  <a href="https://phaseguard-69e18.web.app/">Firebase Deployment</a>
</p>

---

## 🚀 About PhaseGuard

**PhaseGuard** is an AI-powered electrical monitoring and predictive analytics platform designed to detect three-phase electrical imbalance, identify abnormal operating patterns, and forecast potential electrical risks before they develop into serious problems.

The platform monitors the three electrical phases:

* 🔴 **R Phase** – Red Phase
* 🟡 **Y Phase** – Yellow Phase
* 🔵 **B Phase** – Blue Phase

Using machine learning algorithms, PhaseGuard analyses historical electrical readings, predicts phase currents 30 minutes ahead, detects anomalies, calculates imbalance percentages, and generates intelligent load-redistribution recommendations.

Our goal is simple:

**Predict the Imbalance. Prevent the Failure.**

## 🌐 Live Deployment

| Component          | Link                              |
| ------------------ | --------------------------------- |
| Live Website       | https://phaseguard-69e18.web.app/ |
| Hosting Platform   | Firebase Hosting                  |
| Backend Framework  | FastAPI                           |
| Frontend Framework | React + Vite                      |

> Note: The live website is the frontend deployment. The Python backend must also be deployed and connected through `VITE_API_URL` for AI-powered features to work online.

---

## ✨ Key Features

### 1. Overview – Home Dashboard

* Overall electrical system status.
* AI-generated risk level.
* Three-phase current summary.
* Important electrical alerts.
* Quick access to monitoring and forecasting.

### 2. Live Monitoring

* R/Y/B phase current monitoring.
* Voltage monitoring.
* Frequency monitoring.
* Electrical parameter visualisation.
* Historical and supplied reading status.

### 3. AI Forecasting

* 30-minute-ahead phase-current predictions.
* Current versus predicted current comparison.
* Future imbalance percentage.
* AI-generated forecasting results.
* Phase-wise prediction analysis.

### 4. Anomaly Detection

* Abnormal electrical pattern detection.
* Isolation Forest-based anomaly identification.
* Overload risk awareness.
* High, Medium and Low risk indicators.
* Abnormal phase behaviour analysis.

### 5. Load Optimisation

* Intelligent load-redistribution suggestions.
* Identification of the highest and lowest current phases.
* Phase imbalance analysis.
* Recommendations for further electrical inspection.

### 6. Reports & Analytics

* Historical electrical trends.
* Phase-wise performance analysis.
* Current and predicted current graphs.
* Model validation metrics.
* Downloadable reports based on available records.

### 7. Devices & Sensors

* Device information.
* Sensor connection status when hardware integration is available.
* Meter information.
* Data connection monitoring.

---

## 🧠 AI & Machine Learning Models

PhaseGuard uses three machine learning models in its existing Python backend.

| Model                   | Algorithm               | Purpose                                         |
| ----------------------- | ----------------------- | ----------------------------------------------- |
| Phase Forecasting       | Random Forest Regressor | Predicts R/Y/B currents 30 minutes ahead.       |
| Anomaly Detection       | Isolation Forest        | Detects unusual electrical patterns.            |
| Grid Demand Forecasting | Extra Trees Regressor   | Predicts PowerZoo grid demand 30 minutes ahead. |

### 1. Random Forest Regressor

Used for three-phase current forecasting.

* Analyses historical electrical readings.
* Uses current and voltage measurements.
* Uses lag-based and rolling statistical features.
* Predicts future R, Y and B phase currents.
* Forecast horizon: 30 minutes.

### 2. Isolation Forest

Used for electrical anomaly detection.

* Identifies unusual electrical operating conditions.
* Analyses phase currents and voltages.
* Considers available electrical parameters.
* Generates an anomaly detection result.

### 3. Extra Trees Regressor

Used for a separate PowerZoo grid-demand forecasting task.

* Analyses historical grid-demand values.
* Uses previous demand readings and rolling averages.
* Predicts operational demand 30 minutes ahead.

**Important:** PowerZoo grid-demand predictions are separate from R/Y/B phase-current predictions. Their units must not be mixed.

---

## 📊 Datasets Used

### 1. Praxis Crompton Greeves

Dataset: https://huggingface.co/datasets/narteybrown/praxis-crompton-greeves

Used for:

* Three-phase current analysis.
* Voltage analysis.
* Historical electrical readings.
* Phase-current forecasting.
* Anomaly detection.

### 2. PowerZoo Dataset

Dataset: https://huggingface.co/datasets/PowerZooJax/PowerZooDataset

Subset: `aemo_5min_demand`

Used for:

* Historical grid-demand analysis.
* Demand forecasting.
* 30-minute-ahead demand prediction.

---

## ⚙️ Technology Stack

| Category                | Technology            |
| ----------------------- | --------------------- |
| Frontend                | React                 |
| Programming Language    | TypeScript            |
| Styling                 | Tailwind CSS          |
| Build Tool              | Vite                  |
| Backend                 | Python                |
| API Framework           | FastAPI               |
| Machine Learning        | Scikit-learn          |
| Data Processing         | Pandas, NumPy         |
| Model Storage           | Joblib                |
| Dataset Management      | Hugging Face Datasets |
| Development Environment | Google Colab          |
| Frontend Hosting        | Firebase Hosting      |

---

## 🔌 Backend API Integration

PhaseGuard uses FastAPI to connect the frontend with its existing machine learning models.

### Available API Endpoints

| Method | Endpoint             | Description                                         |
| ------ | -------------------- | --------------------------------------------------- |
| GET    | `/health`            | Checks backend and model status.                    |
| GET    | `/model-info`        | Returns model information and validation metrics.   |
| GET    | `/demo`              | Generates predictions using historical Praxis data. |
| POST   | `/predict`           | Predicts phase currents from supplied readings.     |
| GET    | `/powerzoo-info`     | Returns PowerZoo model status.                      |
| POST   | `/powerzoo-forecast` | Predicts future grid demand.                        |

### API Details

**1. GET /health**

Checks whether the backend and trained models are available.

**2. GET /model-info**

Returns:

* Model names.
* Forecast horizon.
* Phase order.
* Validation MAE.
* Training dataset information.
* PowerZoo model status.

**3. GET /demo**

Uses historical Praxis dataset readings to generate an initial demonstration prediction.

The response includes:

* Current phase values.
* Predicted phase values.
* Current imbalance percentage.
* Predicted imbalance percentage.
* Anomaly status.
* Risk level.
* Recommendations.
* Historical data source information.

**4. POST /predict**

Accepts user-supplied electrical readings.

Minimum requirement:

* 31 consecutive one-minute readings.

Required JSON fields:

```json
{
  "history": [
    {
      "Phase1_Current": 12.4,
      "Phase2_Current": 11.9,
      "Phase3_Current": 12.1,
      "Phase1_Voltage": 230.1,
      "Phase2_Voltage": 229.8,
      "Phase3_Voltage": 230.4
    }
  ]
}
```

The example represents one reading only. A valid request must contain at least 31 consecutive readings. Optional fields include frequency, power factor, active power, reactive power, temperature and other supported electrical parameters.

**5. GET /powerzoo-info**

Checks whether the PowerZoo model was successfully trained.

**6. POST /powerzoo-forecast**

Accepts at least 12 consecutive five-minute grid-demand readings.

Example:

```json
{
  "history": [
    100.0, 101.2, 99.8, 102.1,
    103.0, 101.5, 100.7, 102.4,
    104.0, 103.2, 102.8, 105.1
  ]
}
```

Returns the predicted grid demand, forecast horizon, region and unit.

> All example numbers are illustrative, not actual sensor readings or model results.

---

## 🏗️ System Architecture

```text
       HISTORICAL DATASETS
                |
        +-------+-------+
        |               |
      PRAXIS          POWERZOO
        |               |
        v               v
   DATA PROCESSING   DATA PROCESSING
        |               |
        v               v
   RANDOM FOREST     EXTRA TREES
        |
        +-------------------+
        |                   |
        v                   v
   ISOLATION FOREST    PHASE FORECAST
        |                   |
        +---------+---------+
                  |
                  v
             FASTAPI
                  |
                  v
          REACT + VITE UI
                  |
                  v
          FIREBASE HOSTING
                  |
                  v
          PHASEGUARD DASHBOARD
```

---

## 📁 Project Structure

```text
PhaseGuard/
│
├── backend/
│   ├── main.py
│   ├── train_and_cache.py
│   ├── requirements.txt
│   │
│   └── models/
│       └── phaseguard_sample_history.csv
│
├── frontend/
│   ├── dist/
│   │   ├── assets/
│   │   ├── index.html
│   │   └── splash-hero.jpg
│   │
│   ├── src/
│   │   ├── context/
│   │   │   └── PowerContext.tsx
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── api.ts
│   │   │
│   │   └── App.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── firebase.json
├── .gitignore
└── README.md
```

This represents the intended repository organisation. The original supplied Python script is a single-cell Google Colab backend and does not automatically generate all these separate files.

---

## 💻 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
cd PhaseGuard
```

### Step 2: Backend Setup

Open Google Colab and run the supplied Python backend script:

`PhaseGuard_Colab_One_Cell.py`

The script automatically:

* Installs required Python dependencies.
* Loads the Praxis dataset.
* Loads the PowerZoo dataset.
* Trains the machine learning models.
* Trains the anomaly detector.
* Saves model artifacts.
* Starts the FastAPI server.

Once execution finishes, the script displays the API URL.

### Step 3: Check Backend

Open the following endpoints using your running backend URL:

```text
YOUR_API_URL/health
YOUR_API_URL/model-info
YOUR_API_URL/demo
YOUR_API_URL/docs
```

### Step 4: Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

### Step 5: Environment Configuration

Create a `.env` file inside the frontend directory.

```env
VITE_API_URL=http://127.0.0.1:8000
```

For a hosted backend, replace the URL with your deployed FastAPI backend address.

Also maintain an `.env.example` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Step 6: Start Frontend

```bash
npm run dev
```

### Step 7: Production Build

```bash
npm run build
```

The generated production files will be available inside:

```text
frontend/dist/
```

---

## ☁️ Deployment

### Frontend Deployment – Firebase

Live deployment:

**https://phaseguard-69e18.web.app/**

To deploy an updated frontend:

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

Ensure Firebase Hosting is configured to use the correct `dist` directory.

### Backend Deployment – FastAPI

The backend can run in Google Colab for development and demonstrations.

For persistent deployment:

1. Separate the FastAPI application from the Colab notebook.
2. Preserve the existing trained models and inference functions.
3. Make sure model artifacts and required datasets are available.
4. Install backend dependencies.
5. Deploy the FastAPI service to a Python-compatible hosting platform.
6. Configure CORS for the deployed frontend domain.
7. Update `VITE_API_URL` with the deployed backend address.
8. Rebuild and redeploy the frontend.

**Note:** Google Colab sessions are temporary. The API stops working when the runtime disconnects. Firebase Hosting serves the frontend; it does not automatically host the Python backend.

---

## ⚠️ Important Data & Safety Information

PhaseGuard distinguishes between historical demonstration data and actual electrical measurements.

* `/demo` uses historical Praxis dataset readings.
* `/predict` uses client-supplied electrical readings.
* Historical data must never be labelled as live sensor telemetry.
* A successful backend health check does not mean physical sensors are connected.
* Voltage and frequency should only be displayed when actual values are available.
* Model validation MAE should not be presented as a fabricated accuracy percentage.
* Recommendations are decision-support suggestions, not automatic electrical control commands.

**Electrical Safety Disclaimer:**

PhaseGuard is an educational and research prototype. It is not a certified electrical protection system or a replacement for qualified electrical engineers.

All load redistribution and electrical switching decisions must be verified by qualified professionals. Always consider cable ratings, breaker ratings, neutral loading, equipment specifications and applicable electrical safety standards.

---

## 🔮 Future Improvements

* Real-time IoT meter integration.
* Live electrical sensor monitoring.
* Persistent alert history.
* Automated report generation.
* Advanced anomaly explanations.
* Configurable electrical thresholds.
* Device authentication and management.
* Improved forecasting with additional site-specific datasets.
* Notification integration for critical electrical events.

---

## 🤝 Contribution

We welcome developers, researchers and electrical engineering enthusiasts to contribute to PhaseGuard.

Contributions can include:

* Machine learning improvements.
* Frontend and dashboard enhancements.
* Electrical data analysis.
* IoT and hardware integration.
* Testing and documentation.

Please submit suggestions, bug reports or pull requests with clear descriptions.

---

## 🙌 Acknowledgements

Special thanks to:

* Praxis Crompton Greeves dataset contributors.
* PowerZoo dataset contributors.
* Hugging Face.
* Scikit-learn.
* FastAPI.
* React and Vite.
* Firebase.
* The open-source developer community.

---

<p align="center">
  <b>⚡ PhaseGuard</b><br/>
  Predict the Imbalance. Prevent the Failure.
  <br/><br/>
  <a href="https://phaseguard-69e18.web.app/"><b>Visit Live Project →</b></a>
</p>
