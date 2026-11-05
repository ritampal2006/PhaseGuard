export interface PhaseValues {
  R: number;
  Y: number;
  B: number;
}

export interface Reading {
  Timestamp?: string;
  Phase1_Current: number;
  Phase2_Current: number;
  Phase3_Current: number;
  Phase1_Voltage: number;
  Phase2_Voltage: number;
  Phase3_Voltage: number;
  Active_Power?: number;
  Reactive_Power?: number;
  Power_Factor?: number;
  Frequency?: number;
  Stator_Temperature?: number;
  Bearing_Temperature?: number;
  Ambient_Temperature?: number;
  Current_Unbalance?: number;
  THD_Current?: number;
  Vibration_X?: number;
  Vibration_Y?: number;
  Vibration_Z?: number;
  Motor_Speed?: number;
  Torque?: number;
  Failure_Code?: number;
}

export interface PredictResponse {
  forecast_horizon_minutes: number;
  current: PhaseValues;
  forecast: PhaseValues;
  imbalance_percent: number;
  predicted_imbalance_percent: number;
  anomaly_detected: boolean;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  validation_mae_amperes: PhaseValues;
  disclaimer: string;
  demo_mode?: boolean;
  data_source?: string;
}

export interface ModelInfo {
  phase_model: string;
  anomaly_model: string;
  forecast_horizon_minutes: number;
  phase_order: string[];
  phase_validation_mae_amperes: PhaseValues;
  praxis_training_rows: number;
  powerzoo: {
    loaded: boolean;
    dataset?: string;
    subset?: string;
    region?: string;
    training_rows?: number;
    validation_mae?: number;
    forecast_horizon_minutes?: number;
    unit?: string;
    reason?: string;
  };
}

export interface HealthResponse {
  status: string;
  phase_model_loaded: boolean;
  anomaly_model_loaded: boolean;
  powerzoo_model_loaded?: boolean;
}

export interface PowerZooForecastResponse {
  forecast_horizon_minutes: number;
  predicted_grid_demand: number;
  unit: string;
  region?: string;
  model: string;
}

export interface HistoryResponse {
  count: number;
  data_source: string;
  readings: Reading[];
}

