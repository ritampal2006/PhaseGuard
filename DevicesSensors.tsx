import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Radio,
  Wifi,
  Server,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  FileCode,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { Reading, PredictResponse, ModelInfo } from '../types/api';
import { apiService, getBaseApiUrl } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

interface DevicesSensorsProps {
  history: Reading[];
  onCustomPredictionSuccess: (result: PredictResponse) => void;
  modelInfo: ModelInfo | null;
}

export const DevicesSensors: React.FC<DevicesSensorsProps> = ({
  history,
  onCustomPredictionSuccess,
  modelInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('balanced');
  const [customJson, setCustomJson] = useState<string>('');

  // Connected Devices inventory
  const devices = [
    {
      id: 'DEV-PRAXIS-01',
      name: 'Praxis Crompton Greaves Pump Node',
      type: 'Three-Phase Motor Telemetry Logger',
      ip: '192.168.1.104',
      status: 'ONLINE',
      sampling: '1 sample/minute',
      latency: '24ms',
      channels: '3x Current (CT), 3x Voltage (PT), Vibration, Stator RTD',
      firmware: 'v3.4.12-industrial',
    },
    {
      id: 'MTR-FEEDER-03',
      name: 'Schneider PowerLogic PM8000',
      type: 'Class 0.2S Revenue Quality Meter',
      ip: '192.168.1.112',
      status: 'ONLINE',
      sampling: '100ms RMS',
      latency: '18ms',
      channels: 'True RMS, THD, Individual Harmonics to 63rd',
      firmware: 'v2.1.0',
    },
    {
      id: 'RTD-THERM-BUS',
      name: 'PT100 8-Channel Stator Temperature Bus',
      type: 'Thermocouple Multiplexer',
      ip: '192.168.1.120',
      status: 'ONLINE',
      sampling: '1 sample/sec',
      latency: '12ms',
      channels: 'Stator U/V/W, Drive End Bearing, Non-Drive End Bearing',
      firmware: 'v1.0.8',
    },
    {
      id: 'GW-EDGE-AI-01',
      name: 'PhaseGuard Industrial Edge Gateway',
      type: 'FastAPI AI Inference Unit',
      ip: getBaseApiUrl(),
      status: 'ONLINE',
      sampling: '30-minute lookahead',
      latency: '8ms',
      channels: 'RandomForest (120 Trees) + IsolationForest (150 Trees)',
      firmware: 'PhaseGuard Core 2.0',
    },
  ];

  // Helper to generate 31-minute scenario readings for testing POST /predict
  const generateScenarioReadings = (type: string): Reading[] => {
    const baseCurrent = 2.03;
    const baseVolt = 415.0;
    const readings: Reading[] = [];
    const now = new Date();

    for (let i = 31; i >= 1; i--) {
      const time = new Date(now.getTime() - i * 60000).toISOString();
      let r = baseCurrent + (Math.random() * 0.04 - 0.02);
      let y = baseCurrent + (Math.random() * 0.04 - 0.02);
      let b = baseCurrent + (Math.random() * 0.04 - 0.02);
      let thd = 3.1;
      let stator = 42.0;

      if (type === 'imbalance_r') {
        // High phase R overload
        r = baseCurrent + 0.35 + (31 - i) * 0.01;
      } else if (type === 'sag_y') {
        // Phase Y dropping
        y = baseCurrent - 0.28;
      } else if (type === 'harmonic_outlier') {
        // High harmonic outlier
        thd = 8.5;
        stator = 62.0;
        r = baseCurrent + 0.15;
      }

      readings.push({
        Timestamp: time,
        Phase1_Current: Number(r.toFixed(3)),
        Phase2_Current: Number(y.toFixed(3)),
        Phase3_Current: Number(b.toFixed(3)),
        Phase1_Voltage: Number(baseVolt.toFixed(1)),
        Phase2_Voltage: Number(baseVolt.toFixed(1)),
        Phase3_Voltage: Number(baseVolt.toFixed(1)),
        Frequency: 50.0,
        Power_Factor: 0.89,
        THD_Current: thd,
        Stator_Temperature: stator,
        Bearing_Temperature: stator + 3.0,
      });
    }
    return readings;
  };

  const handleRunPredict = async (scenarioKey: string) => {
    setActiveScenario(scenarioKey);
    setLoading(true);
    setError(null);
    try {
      let payload: Reading[];
      if (scenarioKey === 'custom') {
        payload = JSON.parse(customJson);
      } else {
        payload = generateScenarioReadings(scenarioKey);
      }

      if (payload.length < 31) {
        throw new Error('At least 31 consecutive 1-minute readings are required by the AI model.');
      }

      const res = await apiService.postPredict(payload);
      setPredictResult(res);
      onCustomPredictionSuccess(res);
    } catch (err: any) {
      setError(err.message || 'POST /predict failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">Devices & Sensor Fleet</h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              4 CONNECTED UNITS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connected current transformers, voltage sensors, temperature probes, and client-supplied inference portal
          </p>
        </div>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{dev.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{dev.id}</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {dev.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Function:</span>
                <span>{dev.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoint / IP:</span>
                <span className="font-mono text-blue-400">{dev.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sampling Rate:</span>
                <span className="font-mono text-slate-200">{dev.sampling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ping Latency:</span>
                <span className="font-mono text-emerald-400">{dev.latency}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>FW: {dev.firmware}</span>
              <span className="text-slate-400 font-mono">Encrypted TLS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actual Supplied Electrical Readings Tester (POST /predict) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Client-Supplied Electrical Readings Tester
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                  POST /predict
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supply 31+ consecutive one-minute readings to the actual model and observe real predictions
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Mode:{' '}
            <span className="text-amber-400 font-bold">Client-Supplied Telemetry</span>
          </span>
        </div>

        {/* Preset Scenarios Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select a Preset Electrical Scenario to Test:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleRunPredict('balanced')}
              disabled={loading}
              className={`p-3 rounded-xl border text-left transition ${
                activeScenario === 'balanced'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="font-bold text-xs text-emerald-400">Scenario 1: Symmetrical Balanced</div>
              <div className="text-[11px] text-slate-400 mt-1">
                R: ~2.03A, Y: ~2.03A, B: ~2.03A (Nominal)
              </div>
            </button>

            <button
              onClick={() => handleRunPredict('imbalance_r')}
              disabled={loading}
              className={`p-3 rounded-xl border text-left transition ${
                activeScenario === 'imbalance_r'
                  ? 'bg-red-600/20 border-red-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="font-bold text-xs text-red-400">Scenario 2: Heavy Phase R Overload</div>
              <div className="text-[11px] text-slate-400 mt-1">
                R: ~2.45A, Y: ~2.03A, B: ~2.03A (Asymmetrical)
              </div>
            </button>

            <button
              onClick={() => handleRunPredict('harmonic_outlier')}
              disabled={loading}
              className={`p-3 rounded-xl border text-left transition ${
                activeScenario === 'harmonic_outlier'
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="font-bold text-xs text-purple-400">Scenario 3: Harmonic Distortion</div>
              <div className="text-[11px] text-slate-400 mt-1">
                THD: 8.5%, Stator Temp: 62°C (Outlier)
              </div>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Predict Response Display */}
        {predictResult && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Inference Result from POST /predict:
              </span>
              <RiskBadge level={predictResult.risk_level} size="sm" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Now Imbalance</span>
                <span className="text-white font-bold text-sm">
                  {predictResult.imbalance_percent}%
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">+30m Predicted</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {predictResult.predicted_imbalance_percent}%
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Anomaly Flag</span>
                <span
                  className={`font-bold text-sm ${
                    predictResult.anomaly_detected ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {predictResult.anomaly_detected ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-sans block">Data Source</span>
                <span className="text-blue-400 font-bold text-[11px] truncate block">
                  {predictResult.data_source || 'Client-supplied readings'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
              <strong className="text-white">Recommendation:</strong> {predictResult.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

