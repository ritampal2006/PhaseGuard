import React, { useState } from 'react';
import {
  TrendingUp,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  Server,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { PredictResponse, ModelInfo, PowerZooForecastResponse } from '../types/api';
import { apiService } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface AIForecastingProps {
  prediction: PredictResponse | null;
  modelInfo: ModelInfo | null;
  onRefreshDemo: () => void;
  isLoading: boolean;
}

export const AIForecasting: React.FC<AIForecastingProps> = ({
  prediction,
  modelInfo,
  onRefreshDemo,
  isLoading,
}) => {
  const current = prediction?.current || { R: 2.02, Y: 2.03, B: 2.04 };
  const forecast = prediction?.forecast || { R: 2.03, Y: 2.00, B: 2.00 };
  const imbNow = prediction?.imbalance_percent ?? 0.51;
  const imbPred = prediction?.predicted_imbalance_percent ?? 0.99;

  // PowerZoo AEMO state
  const [pzLoading, setPzLoading] = useState(false);
  const [pzResult, setPzResult] = useState<PowerZooForecastResponse | null>(null);
  const [pzError, setPzError] = useState<string | null>(null);
  const [customDemand, setCustomDemand] = useState<string>(
    '7450, 7510, 7580, 7620, 7690, 7750, 7810, 7880, 7920, 8010, 8070, 8150'
  );

  // 30-minute trajectory generation between current and forecast
  const trajectoryData = [0, 5, 10, 15, 20, 25, 30].map((min) => {
    const factor = min / 30;
    const rVal = current.R + (forecast.R - current.R) * factor;
    const yVal = current.Y + (forecast.Y - current.Y) * factor;
    const bVal = current.B + (forecast.B - current.B) * factor;
    return {
      minute: min === 0 ? 'Now' : `+${min}m`,
      Phase_R: Number(rVal.toFixed(3)),
      Phase_Y: Number(yVal.toFixed(3)),
      Phase_B: Number(bVal.toFixed(3)),
    };
  });

  const comparisonData = [
    {
      name: 'Phase R (Red)',
      'Current (A)': Number(current.R.toFixed(3)),
      'Predicted +30m (A)': Number(forecast.R.toFixed(3)),
      Delta: Number((forecast.R - current.R).toFixed(3)),
    },
    {
      name: 'Phase Y (Yellow)',
      'Current (A)': Number(current.Y.toFixed(3)),
      'Predicted +30m (A)': Number(forecast.Y.toFixed(3)),
      Delta: Number((forecast.Y - current.Y).toFixed(3)),
    },
    {
      name: 'Phase B (Blue)',
      'Current (A)': Number(current.B.toFixed(3)),
      'Predicted +30m (A)': Number(forecast.B.toFixed(3)),
      Delta: Number((forecast.B - current.B).toFixed(3)),
    },
  ];

  const handleRunPowerZoo = async () => {
    setPzLoading(true);
    setPzError(null);
    try {
      const numbers = customDemand
        .split(',')
        .map((x) => parseFloat(x.trim()))
        .filter((x) => !isNaN(x));

      if (numbers.length < 12) {
        throw new Error('Please enter at least 12 comma-separated demand values.');
      }

      const res = await apiService.postPowerZooForecast(numbers);
      setPzResult(res);
    } catch (err: any) {
      setPzError(err.message || 'PowerZoo forecast failed');
    } finally {
      setPzLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">AI 30-Minute Forecasting</h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PRAXIS MULTI-LAG REGRESSION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive load distribution 30 minutes in advance to prevent thermal breakdown and neutral burnout
          </p>
        </div>

        <button
          onClick={onRefreshDemo}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-compute 30m Forecast</span>
        </button>
      </div>

      {/* Primary Forecast Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phase R Delta */}
        <div className="bg-[#0F172A] border-l-4 border-l-red-500 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-xs font-semibold text-slate-400 uppercase">Phase R Forecast</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {forecast.R.toFixed(3)} A
            </span>
            <span
              className={`text-xs font-bold ${
                forecast.R >= current.R ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {forecast.R >= current.R ? '↑' : '↓'}{' '}
              {Math.abs(forecast.R - current.R).toFixed(3)} A
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Base: {current.R.toFixed(3)} A • MAE: ±
            {modelInfo?.phase_validation_mae_amperes?.R?.toFixed(3) || '0.024'}A
          </div>
        </div>

        {/* Phase Y Delta */}
        <div className="bg-[#0F172A] border-l-4 border-l-amber-400 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-xs font-semibold text-slate-400 uppercase">Phase Y Forecast</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {forecast.Y.toFixed(3)} A
            </span>
            <span
              className={`text-xs font-bold ${
                forecast.Y >= current.Y ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {forecast.Y >= current.Y ? '↑' : '↓'}{' '}
              {Math.abs(forecast.Y - current.Y).toFixed(3)} A
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Base: {current.Y.toFixed(3)} A • MAE: ±
            {modelInfo?.phase_validation_mae_amperes?.Y?.toFixed(3) || '0.017'}A
          </div>
        </div>

        {/* Phase B Delta */}
        <div className="bg-[#0F172A] border-l-4 border-l-blue-500 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-xs font-semibold text-slate-400 uppercase">Phase B Forecast</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {forecast.B.toFixed(3)} A
            </span>
            <span
              className={`text-xs font-bold ${
                forecast.B >= current.B ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {forecast.B >= current.B ? '↑' : '↓'}{' '}
              {Math.abs(forecast.B - current.B).toFixed(3)} A
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Base: {current.B.toFixed(3)} A • MAE: ±
            {modelInfo?.phase_validation_mae_amperes?.B?.toFixed(3) || '0.017'}A
          </div>
        </div>

        {/* Imbalance Shift */}
        <div className="bg-[#0F172A] border-l-4 border-l-purple-500 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-xs font-semibold text-slate-400 uppercase">Future Imbalance Shift</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                imbPred >= 5 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {imbPred.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400">
              (from {imbNow.toFixed(2)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {imbPred < 5 ? 'Status: Balanced Horizon' : 'Warning: Approaching Threshold'}
          </div>
        </div>
      </div>

      {/* Trajectory & Comparison Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 30-Minute Projected Horizon Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                30-Minute Horizon Forecast Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Modeled ampere escalation from Now (T+0) to 30 minutes forward (T+30)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-red-400 font-semibold">• Phase R</span>
              <span className="text-amber-400 font-semibold">• Phase Y</span>
              <span className="text-blue-400 font-semibold">• Phase B</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="minute" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0F1D',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Phase_R"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#EF4444' }}
                />
                <Line
                  type="monotone"
                  dataKey="Phase_Y"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="Phase_B"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Delta Bar Comparison (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Measured vs Forecast Amperes
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Direct phase-by-phase difference between present reading and +30 min prediction
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0F1D',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Current (A)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Predicted +30m (A)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Algorithm: Random Forest Regressor</span>
            <span className="font-mono text-emerald-400">120 Estimators</span>
          </div>
        </div>
      </div>

      {/* Secondary PowerZoo AEMO Grid-Demand Forecaster Module */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  PowerZoo AEMO Grid Demand Forecaster
                </h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded">
                  POST /powerzoo-forecast
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AEMO 5-minute operational grid demand prediction (ExtraTreesRegressor, NSW1 Region)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Status:{' '}
            <span className="text-emerald-400 font-bold">
              {modelInfo?.powerzoo?.loaded ? 'Loaded (NSW1)' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Last 12 Demand Readings (MW in source, 5-minute intervals)
            </label>
            <textarea
              rows={2}
              value={customDemand}
              onChange={(e) => setCustomDemand(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="e.g. 7450, 7510, 7580, 7620, 7690, 7750, 7810, 7880, 7920, 8010, 8070, 8150"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Enter at least 12 readings separated by commas.</span>
              <button
                onClick={handleRunPowerZoo}
                disabled={pzLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                {pzLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Predict +30m Grid Demand</span>
              </button>
            </div>

            {pzError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {pzError}
              </div>
            )}
          </div>

          {/* PowerZoo Result Card */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              30-Min Grid Forecast Result
            </div>
            {pzResult ? (
              <div className="space-y-2">
                <div className="text-3xl font-black font-mono text-purple-400">
                  {pzResult.predicted_grid_demand.toFixed(1)}{' '}
                  <span className="text-xs font-sans text-slate-300">MW</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Region: <span className="font-bold text-white">{pzResult.region || 'NSW1'}</span></div>
                  <div>Model: <span className="font-mono text-slate-400">{pzResult.model}</span></div>
                  <div>Horizon: <span className="font-mono text-slate-400">30 minutes</span></div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Click &ldquo;Predict +30m Grid Demand&rdquo; to call the real PowerZoo endpoint.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

