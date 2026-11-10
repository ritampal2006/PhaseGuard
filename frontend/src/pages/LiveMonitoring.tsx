import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Download,
  Zap,
  Gauge,
  Thermometer,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Reading, PredictResponse } from '../types/api';
import { usePower } from '../context/PowerContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface LiveMonitoringProps {
  history?: Reading[];
  currentPrediction?: PredictResponse | null;
  onRefreshTelemetry?: () => void;
  isLoading?: boolean;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = () => {
  const {
    phaseR,
    phaseY,
    phaseB,
    phaseR_Volt,
    phaseY_Volt,
    phaseB_Volt,
    frequency,
    powerFactor,
    totalActivePower,
    statorTemp,
    bearingTemp,
    thdCurrent,
    neutralCurrent,
    imbalance,
    dateRangeText,
    lastUpdatedDate,
    weeklyTrend,
    secondsRemaining,
    triggerManualCollection,
    updatePhaseCurrents,
    applyPreset,
    activePreset,
    activeScenarioName,
  } = usePower();

  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | 'R' | 'Y' | 'B'>('ALL');

  // Multi-point telemetry series combining context values
  const telemetryHistory = weeklyTrend.map((d, idx) => ({
    time: d.day,
    'Phase R (A)': Number((d.phaseR * (phaseR / 2.02)).toFixed(2)),
    'Phase Y (A)': Number((d.phaseY * (phaseY / 2.03)).toFixed(2)),
    'Phase B (A)': Number((d.phaseB * (phaseB / 2.04)).toFixed(2)),
    'R Voltage (V)': Number((phaseR_Volt + (idx % 2 === 0 ? 0.3 : -0.2)).toFixed(1)),
    'Y Voltage (V)': Number((phaseY_Volt + (idx % 2 === 0 ? -0.4 : 0.1)).toFixed(1)),
    'B Voltage (V)': Number((phaseB_Volt + (idx % 2 === 0 ? 0.1 : -0.3)).toFixed(1)),
  }));

  const handleExportCSV = () => {
    const headers = ['Day', 'Phase R (A)', 'Phase Y (A)', 'Phase B (A)', 'R Voltage', 'Y Voltage', 'B Voltage'];
    const rows = telemetryHistory.map((r) => [
      r.time,
      r['Phase R (A)'],
      r['Phase Y (A)'],
      r['Phase B (A)'],
      r['R Voltage (V)'],
      r['Y Voltage (V)'],
      r['B Voltage (V)'],
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title & Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Three-Phase Telemetry
            </h2>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF]">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              CYCLE: {secondsRemaining}s
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time R/Y/B current, line-to-line voltage, harmonics, and thermal sensor ingestion
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-[#0D9488] transition"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isStreaming ? 'Pause Ingestion' : 'Resume Ingestion'}</span>
          </button>

          <button
            onClick={triggerManualCollection}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20 hover:bg-[#0F766E] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Poll Now</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-[#0D9488] transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Telemetry Gauges matching FinEdge design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Phase R */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-t-4 border-t-red-500">
          <p className="text-[10px] font-bold uppercase text-red-500 tracking-wider">Phase R Current</p>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {phaseR.toFixed(2)} <span className="text-xs font-sans text-slate-400">A</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{phaseR_Volt} V Line-to-N</p>
        </div>

        {/* Phase Y */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-t-4 border-t-amber-400">
          <p className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Phase Y Current</p>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {phaseY.toFixed(2)} <span className="text-xs font-sans text-slate-400">A</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{phaseY_Volt} V Line-to-N</p>
        </div>

        {/* Phase B */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-t-4 border-t-blue-500">
          <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">Phase B Current</p>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {phaseB.toFixed(2)} <span className="text-xs font-sans text-slate-400">A</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{phaseB_Volt} V Line-to-N</p>
        </div>

        {/* Frequency */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Frequency</span>
            <Gauge className="w-3.5 h-3.5 text-[#0D9488]" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {frequency.toFixed(2)} <span className="text-xs font-sans text-slate-400">Hz</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Nominal ±0.05 Hz</p>
        </div>

        {/* Power Factor */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Power Factor</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {powerFactor.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Load: {totalActivePower} kW</p>
        </div>

        {/* Stator Temp */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Motor Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
            {statorTemp.toFixed(1)} <span className="text-xs font-sans text-slate-400">°C</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Bearing: {bearingTemp}°C</p>
        </div>
      </div>

      {/* Main Real-time Waveform Chart */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Three-Phase Waveform & Harmonic Envelope ({dateRangeText})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live continuous telemetry stream synced with 2-minute automated sensor refresh
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(['ALL', 'R', 'Y', 'B'] as const).map((ph) => (
              <button
                key={ph}
                onClick={() => setSelectedPhase(ph)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedPhase === ph
                    ? 'bg-white dark:bg-[#0F172A] text-[#0D9488] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ph === 'ALL' ? 'All Phases' : `Phase ${ph}`}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  border: '1px solid #1E293B',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {(selectedPhase === 'ALL' || selectedPhase === 'R') && (
                <Line type="monotone" dataKey="Phase R (A)" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
              )}
              {(selectedPhase === 'ALL' || selectedPhase === 'Y') && (
                <Line type="monotone" dataKey="Phase Y (A)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
              )}
              {(selectedPhase === 'ALL' || selectedPhase === 'B') && (
                <Line type="monotone" dataKey="Phase B (A)" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default LiveMonitoring;
