import React from 'react';
import {
  Activity,
  Zap,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Clock,
  ArrowUpRight,
  Sliders,
  ChevronRight,
  Layers,
  FileText,
} from 'lucide-react';
import { PredictResponse, ModelInfo, Reading } from '../types/api';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { InteractivePhaseSandbox } from '../components/InteractivePhaseSandbox';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface OverviewProps {
  prediction: PredictResponse | null;
  modelInfo: ModelInfo | null;
  history: Reading[];
  isLoading: boolean;
  onNavigateTab: (tab: any) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  prediction,
  modelInfo,
  history,
  isLoading,
  onNavigateTab,
}) => {
  const current = prediction?.current || { R: 2.02, Y: 2.03, B: 2.04 };
  const forecast = prediction?.forecast || { R: 2.03, Y: 2.00, B: 2.00 };
  const imbalanceNow = prediction?.imbalance_percent ?? 0.51;
  const imbalanceFuture = prediction?.predicted_imbalance_percent ?? 0.99;
  const risk = prediction?.risk_level || 'LOW';
  const anomaly = prediction?.anomaly_detected ?? false;

  // Chart telemetry data: combine latest history or fallback
  const chartData = history.slice(-20).map((item, idx) => ({
    time: item.Timestamp ? item.Timestamp.split(' ')[1] || `T-${20 - idx}m` : `-${20 - idx}m`,
    R: Number(item.Phase1_Current.toFixed(2)),
    Y: Number(item.Phase2_Current.toFixed(2)),
    B: Number(item.Phase3_Current.toFixed(2)),
  }));

  const comparisonData = [
    {
      phase: 'Phase R',
      Current: Number(current.R.toFixed(3)),
      'Predicted (+30m)': Number(forecast.R.toFixed(3)),
    },
    {
      phase: 'Phase Y',
      Current: Number(current.Y.toFixed(3)),
      'Predicted (+30m)': Number(forecast.Y.toFixed(3)),
    },
    {
      phase: 'Phase B',
      Current: Number(current.B.toFixed(3)),
      'Predicted (+30m)': Number(forecast.B.toFixed(3)),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">Overview Dashboard</h2>
            <RiskBadge level={risk} />
            {anomaly && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                Anomaly Detected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time three-phase electrical telemetry and 30-minute predictive failure prevention
          </p>
        </div>

        {/* Data Source Badge matching requirements */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Data Source:</span>
          <span className="font-semibold text-blue-400">
            {prediction?.data_source || 'Praxis Crompton Greaves Dataset'}
          </span>
          {prediction?.demo_mode && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              DEMO
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Row matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phase R Current */}
        <StatCard
          title="Phase R Current"
          value={current.R.toFixed(2)}
          unit="A"
          icon={Activity}
          iconColor="text-red-400"
          iconBg="bg-red-500/10"
          phase="R"
          trend={`${(forecast.R - current.R > 0 ? '+' : '') + (forecast.R - current.R).toFixed(2)}A at +30m`}
          trendDirection={forecast.R > current.R ? 'up' : 'down'}
          sparklineData={chartData.map((d) => d.R)}
          sparklineColor="#EF4444"
        />

        {/* Phase Y Current */}
        <StatCard
          title="Phase Y Current"
          value={current.Y.toFixed(2)}
          unit="A"
          icon={Activity}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          phase="Y"
          trend={`${(forecast.Y - current.Y > 0 ? '+' : '') + (forecast.Y - current.Y).toFixed(2)}A at +30m`}
          trendDirection={forecast.Y > current.Y ? 'up' : 'down'}
          sparklineData={chartData.map((d) => d.Y)}
          sparklineColor="#F59E0B"
        />

        {/* Phase B Current */}
        <StatCard
          title="Phase B Current"
          value={current.B.toFixed(2)}
          unit="A"
          icon={Activity}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          phase="B"
          trend={`${(forecast.B - current.B > 0 ? '+' : '') + (forecast.B - current.B).toFixed(2)}A at +30m`}
          trendDirection={forecast.B > current.B ? 'up' : 'down'}
          sparklineData={chartData.map((d) => d.B)}
          sparklineColor="#3B82F6"
        />

        {/* Current Imbalance % */}
        <StatCard
          title="Electrical Imbalance"
          value={imbalanceNow.toFixed(2)}
          unit="%"
          icon={AlertTriangle}
          iconColor={imbalanceNow >= 5 ? 'text-rose-400' : 'text-emerald-400'}
          iconBg={imbalanceNow >= 5 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}
          trend={`Proj: ${imbalanceFuture.toFixed(2)}% in 30m`}
          trendDirection={imbalanceFuture > imbalanceNow ? 'up' : 'neutral'}
          subtitle={imbalanceNow < 5 ? 'Within IEC Normal Limits (<5%)' : 'Caution Required'}
        />
      </div>

      {/* Primary Analytics Section: Live Phase Waves & AI Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart: Real-time Telemetry Feed (8 cols) */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Three-Phase Current Dynamics (R/Y/B Stream)
              </h3>
              <p className="text-xs text-slate-400">
                Continuous ampere measurements sampled per minute across three symmetrical phases
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> R
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Y
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> B
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradY" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0F1D',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="R"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradR)"
                />
                <Area
                  type="monotone"
                  dataKey="Y"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradY)"
                />
                <Area
                  type="monotone"
                  dataKey="B"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Nominal Frequency: 50.0 Hz</span>
            <button
              onClick={() => onNavigateTab('live-monitoring')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
            >
              <span>Detailed Telemetry View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current vs 30-Min AI Forecast (4 cols) */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Current vs 30-Min Forecast
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                RF Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Measured amperes versus AI projected load 30 minutes in advance
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="phase" stroke="#64748B" fontSize={11} tickLine={false} />
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
                  <Bar dataKey="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Predicted (+30m)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Forecast Horizon:</span>
              <span className="font-mono text-white font-bold">30 Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Test Value Sandbox: Visualizing OK vs Problem & Why Shifting Occurs */}
      <InteractivePhaseSandbox />

      {/* Bottom Grid: Intelligent Recommendation & Alerts & Model Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Load Redistribution Recommendation Card (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Intelligent Load Redistribution Advice
                </h4>
                <p className="text-xs text-slate-400">
                  Automated engineering guidance to balance phase loads
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('load-optimization')}
              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
            >
              Rebalance Tool
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs leading-relaxed text-slate-200">
            <p className="font-medium">
              {prediction?.recommendation ||
                'Phase currents appear reasonably balanced. Continue monitoring.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Now Imbalance</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {imbalanceNow.toFixed(2)}%
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">+30m Projected</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {imbalanceFuture.toFixed(2)}%
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase">IEC 61000 Limit</div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">5.00%</div>
            </div>
          </div>
        </div>

        {/* Model Accuracy & Specifications (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">AI Model Specs & Validation</h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Praxis Pump
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400">Forecasting Algorithm:</span>
              <span className="font-mono font-semibold text-slate-200">
                {modelInfo?.phase_model || 'RandomForestRegressor'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400">Anomaly Classifier:</span>
              <span className="font-mono font-semibold text-slate-200">
                {modelInfo?.anomaly_model || 'IsolationForest (c=0.04)'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Validation MAE (Amperes):</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Low Error</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-red-400 block font-sans">Phase R</span>
                  <span className="text-slate-200 font-bold">
                    {modelInfo?.phase_validation_mae_amperes?.R?.toFixed(3) ?? '0.024'} A
                  </span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-amber-400 block font-sans">Phase Y</span>
                  <span className="text-slate-200 font-bold">
                    {modelInfo?.phase_validation_mae_amperes?.Y?.toFixed(3) ?? '0.017'} A
                  </span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-blue-400 block font-sans">Phase B</span>
                  <span className="text-slate-200 font-bold">
                    {modelInfo?.phase_validation_mae_amperes?.B?.toFixed(3) ?? '0.017'} A
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Training Samples: {modelInfo?.praxis_training_rows?.toLocaleString() || '3,456'} rows</span>
            <span className="text-blue-400 font-mono">Status: Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

