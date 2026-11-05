import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Download,
  Filter,
  SlidersHorizontal,
  Zap,
  Gauge,
  Thermometer,
  Waves,
} from 'lucide-react';
import { Reading, PredictResponse } from '../types/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface LiveMonitoringProps {
  history: Reading[];
  currentPrediction: PredictResponse | null;
  onRefreshTelemetry: () => void;
  isLoading: boolean;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  history,
  currentPrediction,
  onRefreshTelemetry,
  isLoading,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | 'R' | 'Y' | 'B'>('ALL');
  const [filterQuery, setFilterQuery] = useState('');

  // Auto poll simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onRefreshTelemetry();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [isPlaying, refreshInterval, onRefreshTelemetry]);

  // Latest reading
  const latest = history[history.length - 1] || {
    Phase1_Current: 2.02,
    Phase2_Current: 2.03,
    Phase3_Current: 2.04,
    Phase1_Voltage: 415.2,
    Phase2_Voltage: 414.8,
    Phase3_Voltage: 415.0,
    Frequency: 50.02,
    Power_Factor: 0.89,
    Active_Power: 45.3,
    Reactive_Power: 15.2,
    Stator_Temperature: 43.5,
    Bearing_Temperature: 46.1,
    Ambient_Temperature: 28.5,
    THD_Current: 3.2,
    Current_Unbalance: 0.8,
    Timestamp: new Date().toISOString(),
  };

  const chartData = history.slice(-30).map((r, i) => ({
    time: r.Timestamp ? r.Timestamp.split(' ')[1] || `T-${30 - i}m` : `${i}`,
    'R Current': Number(r.Phase1_Current.toFixed(2)),
    'Y Current': Number(r.Phase2_Current.toFixed(2)),
    'B Current': Number(r.Phase3_Current.toFixed(2)),
    'R Voltage': Number(r.Phase1_Voltage.toFixed(1)),
    'Y Voltage': Number(r.Phase2_Voltage.toFixed(1)),
    'B Voltage': Number(r.Phase3_Voltage.toFixed(1)),
  }));

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Phase1_Current',
      'Phase2_Current',
      'Phase3_Current',
      'Phase1_Voltage',
      'Phase2_Voltage',
      'Phase3_Voltage',
      'Frequency',
      'Power_Factor',
      'THD_Current',
    ];
    const rows = history.map((r) => [
      r.Timestamp || '',
      r.Phase1_Current,
      r.Phase2_Current,
      r.Phase3_Current,
      r.Phase1_Voltage,
      r.Phase2_Voltage,
      r.Phase3_Voltage,
      r.Frequency || 50.0,
      r.Power_Factor || 0.88,
      r.THD_Current || 3.0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phaseguard_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">Live Electrical Monitoring</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time three-phase currents, line-to-line voltages, system frequency, and harmonic metrics
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value={1000}>Poll: 1s</option>
            <option value={3000}>Poll: 3s</option>
            <option value={5000}>Poll: 5s</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Electrical Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Phase R Current */}
        <div className="bg-[#0F172A] border-l-4 border-l-red-500 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400">Phase R Current</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {latest.Phase1_Current.toFixed(2)}{' '}
            <span className="text-xs text-slate-400 font-sans">A</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Volt: {latest.Phase1_Voltage.toFixed(1)}V
          </div>
        </div>

        {/* Phase Y Current */}
        <div className="bg-[#0F172A] border-l-4 border-l-amber-400 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400">Phase Y Current</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {latest.Phase2_Current.toFixed(2)}{' '}
            <span className="text-xs text-slate-400 font-sans">A</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Volt: {latest.Phase2_Voltage.toFixed(1)}V
          </div>
        </div>

        {/* Phase B Current */}
        <div className="bg-[#0F172A] border-l-4 border-l-blue-500 border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400">Phase B Current</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {latest.Phase3_Current.toFixed(2)}{' '}
            <span className="text-xs text-slate-400 font-sans">A</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Volt: {latest.Phase3_Voltage.toFixed(1)}V
          </div>
        </div>

        {/* Frequency */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Frequency</span>
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {(latest.Frequency || 50.0).toFixed(2)}{' '}
            <span className="text-xs text-slate-400 font-sans">Hz</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Nominal ±0.05 Hz</div>
        </div>

        {/* Power Factor */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Power Factor</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {(latest.Power_Factor || 0.88).toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active: {latest.Active_Power || 45.2} kW</div>
        </div>

        {/* Stator Temp */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 shadow">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Stator Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {(latest.Stator_Temperature || 42.0).toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-sans">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Bearing: {(latest.Bearing_Temperature || 45.0).toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Dual Waveform / Oscilloscope Chart (Currents & Voltages) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Currents Waveform */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Three-Phase Current Dynamics (Amperes)
              </h3>
              <p className="text-xs text-slate-400">R, Y, and B phase loadings over time</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> R
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Y
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> B
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="R Current"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Y Current"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="B Current"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Voltages Waveform */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-indigo-400" />
                Three-Phase Voltage Stability (Volts)
              </h3>
              <p className="text-xs text-slate-400">Line-to-line 415V nominal electrical balance</p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Avg: {(latest.Phase1_Voltage || 415).toFixed(1)} V
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[380, 440]} />
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
                  dataKey="R Voltage"
                  stroke="#F87171"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Y Voltage"
                  stroke="#FBBF24"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="B Voltage"
                  stroke="#60A5FA"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Telemetry Data Table matching Image 2 style */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Telemetry Readings</h3>
            <p className="text-xs text-slate-400">
              Continuous sensor data buffer recorded from Praxis Crompton-Greaves unit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedPhase('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedPhase === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Phases
              </button>
              <button
                onClick={() => setSelectedPhase('R')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedPhase === 'R' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phase R
              </button>
              <button
                onClick={() => setSelectedPhase('Y')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedPhase === 'Y' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phase Y
              </button>
              <button
                onClick={() => setSelectedPhase('B')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedPhase === 'B' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phase B
              </button>
            </div>
          </div>
        </div>

        {/* Table Container matching Image 2 */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                {(selectedPhase === 'ALL' || selectedPhase === 'R') && (
                  <th className="py-3 px-4 text-red-400">Phase R (A)</th>
                )}
                {(selectedPhase === 'ALL' || selectedPhase === 'Y') && (
                  <th className="py-3 px-4 text-amber-400">Phase Y (A)</th>
                )}
                {(selectedPhase === 'ALL' || selectedPhase === 'B') && (
                  <th className="py-3 px-4 text-blue-400">Phase B (A)</th>
                )}
                <th className="py-3 px-4">R-Y-B Volt (V)</th>
                <th className="py-3 px-4">Freq (Hz)</th>
                <th className="py-3 px-4">THD %</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.slice(-8).reverse().map((r, idx) => {
                const maxI = Math.max(r.Phase1_Current, r.Phase2_Current, r.Phase3_Current);
                const minI = Math.min(r.Phase1_Current, r.Phase2_Current, r.Phase3_Current);
                const avgI = (r.Phase1_Current + r.Phase2_Current + r.Phase3_Current) / 3;
                const imb = avgI > 0 ? ((maxI - avgI) / avgI) * 100 : 0;
                const statusColor =
                  imb > 10
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : imb > 5
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {r.Timestamp ? r.Timestamp.split('.')[0] : `Sample-${idx}`}
                    </td>
                    {(selectedPhase === 'ALL' || selectedPhase === 'R') && (
                      <td className="py-3 px-4 text-red-300 font-bold">
                        {r.Phase1_Current.toFixed(3)}
                      </td>
                    )}
                    {(selectedPhase === 'ALL' || selectedPhase === 'Y') && (
                      <td className="py-3 px-4 text-amber-300 font-bold">
                        {r.Phase2_Current.toFixed(3)}
                      </td>
                    )}
                    {(selectedPhase === 'ALL' || selectedPhase === 'B') && (
                      <td className="py-3 px-4 text-blue-300 font-bold">
                        {r.Phase3_Current.toFixed(3)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-slate-400">
                      {r.Phase1_Voltage.toFixed(0)} / {r.Phase2_Voltage.toFixed(0)} /{' '}
                      {r.Phase3_Voltage.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {(r.Frequency || 50.0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {(r.THD_Current || 3.1).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-bold border ${statusColor}`}
                      >
                        {imb > 10 ? 'IMBALANCED' : imb > 5 ? 'CAUTION' : 'BALANCED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

