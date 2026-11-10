import React, { useState } from 'react';
import {
  Sliders,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Zap,
  Lock,
  Layers,
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
} from 'recharts';

export const LoadOptimization: React.FC = () => {
  const {
    phaseR,
    phaseY,
    phaseB,
    forecast,
    imbalance,
    predictedImbalance,
    updatePhaseCurrents,
    applyPreset,
    activePreset,
    activeScenarioName,
    dateRangeText,
  } = usePower();

  // Rebalance simulation state
  const [shiftAmount, setShiftAmount] = useState<number>(0.15);
  const [fromPhase, setFromPhase] = useState<'R' | 'Y' | 'B'>('R');
  const [toPhase, setToPhase] = useState<'R' | 'Y' | 'B'>('B');

  // Diagnostics logic
  const isSinglePhasing = phaseR < 0.5 || phaseY < 0.5 || phaseB < 0.5;
  const isNominal = !isSinglePhasing && imbalance < 2.0;
  const isModerate = !isSinglePhasing && imbalance >= 2.0 && imbalance < 10.0;
  const isSevere = !isSinglePhasing && imbalance >= 10.0;

  // Calculate simulated rebalanced currents
  const simR = Number(
    Math.max(
      0.1,
      phaseR - (fromPhase === 'R' ? shiftAmount : 0) + (toPhase === 'R' ? shiftAmount : 0)
    ).toFixed(2)
  );
  const simY = Number(
    Math.max(
      0.1,
      phaseY - (fromPhase === 'Y' ? shiftAmount : 0) + (toPhase === 'Y' ? shiftAmount : 0)
    ).toFixed(2)
  );
  const simB = Number(
    Math.max(
      0.1,
      phaseB - (fromPhase === 'B' ? shiftAmount : 0) + (toPhase === 'B' ? shiftAmount : 0)
    ).toFixed(2)
  );

  const calcImb = (r: number, y: number, b: number) => {
    const avg = (r + y + b) / 3;
    if (avg <= 0) return 0;
    return (Math.max(Math.abs(r - avg), Math.abs(y - avg), Math.abs(b - avg)) / avg) * 100;
  };

  const simulatedImbalance = calcImb(simR, simY, simB);
  const imbalanceDelta = imbalance - simulatedImbalance;

  const comparisonData = [
    {
      name: 'Phase R',
      'Original Load (A)': Number(phaseR.toFixed(2)),
      'After Rebalance (A)': isSinglePhasing ? Number(phaseR.toFixed(2)) : simR,
    },
    {
      name: 'Phase Y',
      'Original Load (A)': Number(phaseY.toFixed(2)),
      'After Rebalance (A)': isSinglePhasing ? Number(phaseY.toFixed(2)) : simY,
    },
    {
      name: 'Phase B',
      'Original Load (A)': Number(phaseB.toFixed(2)),
      'After Rebalance (A)': isSinglePhasing ? Number(phaseB.toFixed(2)) : simB,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelligent Load Optimisation & Diagnostics
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF]">
              AI REDISTRIBUTION
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic phase balancing and root-cause diagnostics explaining when and why load shifting is executed or locked out.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('balanced')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePreset === 'balanced'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>1. Nominal (OK)</span>
          </button>

          <button
            onClick={() => applyPreset('moderate')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePreset === 'moderate'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Caution (Shift Ready)</span>
          </button>

          <button
            onClick={() => applyPreset('severe')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePreset === 'severe'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>3. Severe (Problem)</span>
          </button>

          <button
            onClick={() => applyPreset('phase_loss')}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
              activePreset === 'phase_loss'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>4. Phase Loss (Lockout)</span>
          </button>
        </div>
      </div>

      {/* WHY SHIFTING IS OR IS NOT HAPPENING (Detailed Engineering Explanation) */}
      <div
        className={`rounded-3xl p-6 border shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all ${
          isNominal
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            : isModerate
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : isSevere
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
            : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isNominal
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : isModerate
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                : isSevere
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
            }`}
          >
            {isNominal ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isModerate ? (
              <Sliders className="w-6 h-6" />
            ) : isSevere ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isNominal && 'Status: Balanced & Healthy — Shifting Not Needed'}
                {isModerate && 'Status: Moderate Asymmetry — Automated Shifting Recommended'}
                {isSevere && 'Status: Critical Overload — Breaker Armed (Gradual Shifting Insufficient)'}
                {isSinglePhasing && 'Status: EMERGENCY Phase Loss — Shifting Strictly LOCKED OUT'}
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-current">
                Current Unbalance: {imbalance.toFixed(2)}%
              </span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {isNominal && (
                <p>
                  <strong>Why shifting is suppressed:</strong> The three-phase vectors are symmetrically aligned (R: {phaseR}A, Y: {phaseY}A, B: {phaseB}A). System unbalance ({imbalance.toFixed(2)}%) is well below the 2.0% IEC limit. Executing unnecessary mechanical transfers induces contactor arcing and transient bus disturbances. PhaseGuard holds steady-state monitoring.
                </p>
              )}
              {isModerate && (
                <p>
                  <strong>Why shifting is happening:</strong> Phase R is carrying elevated current while Phase B has available headroom. Shifting {shiftAmount} A of single-phase auxiliary load from Phase R to Phase B reduces imbalance from {imbalance.toFixed(2)}% to {simulatedImbalance.toFixed(2)}%, saving an estimated $380/mo in harmonic heating losses.
                </p>
              )}
              {isSevere && (
                <p>
                  <strong>Why shifting is suspended and trip is armed:</strong> Severe overload detected (Unbalance: {imbalance.toFixed(2)}% &ge; 10%). Incremental contactor rebalancing is too slow to mitigate immediate thermal runaway in motor stator windings. The electronic trip unit (ETU) is armed to isolate the branch before equipment degradation occurs.
                </p>
              )}
              {isSinglePhasing && (
                <p>
                  <strong>Why shifting is LOCKED OUT:</strong> Severe single-phasing failure detected (Phase dropped below 0.50 A). Attempting to shift load to a dead or compromised conductor will create catastrophic negative-sequence currents, causing severe counter-torque and motor winding burnout. The shifting engine is software-interlocked and isolated.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Rebalance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rebalance Control Box (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Redistribution Simulator
          </h4>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Shift Transfer Magnitude (A)
              </label>
              <div className="flex items-center gap-3 mt-1.5">
                <input
                  type="range"
                  min="0.05"
                  max="0.80"
                  step="0.05"
                  disabled={isSinglePhasing}
                  value={shiftAmount}
                  onChange={(e) => setShiftAmount(parseFloat(e.target.value))}
                  className="flex-1 accent-[#0D9488] cursor-pointer"
                />
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 w-14 text-right">
                  {shiftAmount.toFixed(2)} A
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Source Phase (Shed)
                </label>
                <select
                  disabled={isSinglePhasing}
                  value={fromPhase}
                  onChange={(e) => setFromPhase(e.target.value as any)}
                  className="w-full mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="R">Phase R (Red)</option>
                  <option value="Y">Phase Y (Yellow)</option>
                  <option value="B">Phase B (Blue)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Target Phase (Receive)
                </label>
                <select
                  disabled={isSinglePhasing}
                  value={toPhase}
                  onChange={(e) => setToPhase(e.target.value as any)}
                  className="w-full mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="B">Phase B (Blue)</option>
                  <option value="Y">Phase Y (Yellow)</option>
                  <option value="R">Phase R (Red)</option>
                </select>
              </div>
            </div>

            {/* Simulated Outcome Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Predicted Balance Improvement:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {isSinglePhasing ? '0.0% (Locked)' : `${imbalanceDelta > 0 ? '+' : ''}${imbalanceDelta.toFixed(2)}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Post-Shift Imbalance:</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">
                  {isSinglePhasing ? 'N/A' : `${simulatedImbalance.toFixed(2)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Before vs After Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Phase Balance Before vs. After Transfer
              </h4>
              <p className="text-xs text-slate-400">
                Comparative load distribution across conductors
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{dateRangeText}</span>
          </div>

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
                <Bar dataKey="Original Load (A)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="After Rebalance (A)" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoadOptimization;
