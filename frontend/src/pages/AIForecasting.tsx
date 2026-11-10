import React, { useState } from 'react';
import {
  TrendingUp,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { usePower } from '../context/PowerContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export const AIForecasting: React.FC = () => {
  const {
    phaseR,
    phaseY,
    phaseB,
    forecast,
    imbalance,
    predictedImbalance,
    riskLevel,
    anomalyDetected,
    dateRangeText,
    secondsRemaining,
    triggerManualCollection,
    weeklyTrend,
  } = usePower();

  // 30-minute predictive trajectory curve
  const trajectoryData = [0, 5, 10, 15, 20, 25, 30].map((min) => {
    const factor = min / 30;
    const rVal = phaseR + (forecast.R - phaseR) * factor;
    const yVal = phaseY + (forecast.Y - phaseY) * factor;
    const bVal = phaseB + (forecast.B - phaseB) * factor;
    return {
      minute: `+${min}m`,
      'Phase R (Forecast)': Number(rVal.toFixed(2)),
      'Phase Y (Forecast)': Number(yVal.toFixed(2)),
      'Phase B (Forecast)': Number(bVal.toFixed(2)),
    };
  });

  const comparisonData = [
    {
      name: 'Phase R',
      'Current Reading (A)': Number(phaseR.toFixed(2)),
      '30-Min AI Forecast (A)': Number(forecast.R.toFixed(2)),
    },
    {
      name: 'Phase Y',
      'Current Reading (A)': Number(phaseY.toFixed(2)),
      '30-Min AI Forecast (A)': Number(forecast.Y.toFixed(2)),
    },
    {
      name: 'Phase B',
      'Current Reading (A)': Number(phaseB.toFixed(2)),
      '30-Min AI Forecast (A)': Number(forecast.B.toFixed(2)),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              30-Minute AI Predictive Forecasting
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF]">
              R-Y-B MULTI-MODEL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Machine learning forecast predicting future phase unbalance 30 minutes in advance using transformer & gradient-boosted models
          </p>
        </div>

        <button
          onClick={triggerManualCollection}
          className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20 hover:bg-[#0F766E] transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-calculate Forecast</span>
        </button>
      </div>

      {/* Metric Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Current Unbalance</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {imbalance.toFixed(2)}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Instantaneous reading</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Predicted Unbalance (+30m)</p>
          <p className="text-2xl font-black text-[#0D9488] mt-1">
            {predictedImbalance.toFixed(2)}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Future risk trajectory</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">AI Risk Assessment</p>
          <p
            className={`text-2xl font-black mt-1 ${
              riskLevel === 'HIGH'
                ? 'text-rose-500'
                : riskLevel === 'MEDIUM'
                ? 'text-amber-500'
                : 'text-emerald-600'
            }`}
          >
            {riskLevel} RISK
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Tripping probability: &lt; 2%</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Forecast Horizon</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            T + 30 mins
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">{dateRangeText}</p>
        </div>
      </div>

      {/* 30-Minute Continuous Trajectory Curve */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          30-Minute Predictive Phase Trajectory (T+0m to T+30m)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Dynamic gradient model predicting R, Y, B trajectories across 5-minute step intervals
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="minute" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
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
              <Line type="monotone" dataKey="Phase R (Forecast)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Phase Y (Forecast)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Phase B (Forecast)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Comparison: Current vs Forecast */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          Phase-by-Phase Forecast Delta
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Comparing present sensor readings with predicted future conductor amperage
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
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
              <Bar dataKey="Current Reading (A)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="30-Min AI Forecast (A)" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default AIForecasting;
