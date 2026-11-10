import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Info,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const InteractivePhaseSandbox: React.FC = () => {
  // Test values for Phase R, Y, B (Amperes)
  const [phaseR, setPhaseR] = useState<number>(2.02);
  const [phaseY, setPhaseY] = useState<number>(2.03);
  const [phaseB, setPhaseB] = useState<number>(2.04);
  const [transferAmount, setTransferAmount] = useState<number>(0.0);

  // Compute imbalance percentage: max(|I - avg|) / avg * 100
  const avg = (phaseR + phaseY + phaseB) / 3;
  const imbalance = avg > 0 ? (Math.max(Math.abs(phaseR - avg), Math.abs(phaseY - avg), Math.abs(phaseB - avg)) / avg) * 100 : 0;

  // Determine State: OK, WARNING, or CRITICAL PROBLEM
  let stateType: 'OK' | 'WARNING' | 'PROBLEM' | 'PHASE_LOSS' = 'OK';
  if (phaseR < 0.5 || phaseY < 0.5 || phaseB < 0.5) {
    stateType = 'PHASE_LOSS';
  } else if (imbalance >= 10) {
    stateType = 'PROBLEM';
  } else if (imbalance >= 5) {
    stateType = 'WARNING';
  } else {
    stateType = 'OK';
  }

  // Find max and min phases
  const phaseList = [
    { name: 'R', val: phaseR },
    { name: 'Y', val: phaseY },
    { name: 'B', val: phaseB },
  ];
  phaseList.sort((a, b) => b.val - a.val);
  const heaviest = phaseList[0];
  const lightest = phaseList[2];

  // Presets
  const applyPreset = (preset: string) => {
    if (preset === 'ok') {
      setPhaseR(2.02);
      setPhaseY(2.03);
      setPhaseB(2.04);
      setTransferAmount(0.0);
    } else if (preset === 'moderate') {
      setPhaseR(2.28);
      setPhaseY(2.02);
      setPhaseB(1.88);
      setTransferAmount(0.12);
    } else if (preset === 'severe') {
      setPhaseR(2.65);
      setPhaseY(1.98);
      setPhaseB(1.82);
      setTransferAmount(0.35);
    } else if (preset === 'drop') {
      setPhaseR(2.15);
      setPhaseY(0.25);
      setPhaseB(2.10);
      setTransferAmount(0.0);
    }
  };

  // Rebalanced values if shifting is applied
  const simR = phaseR - (heaviest.name === 'R' ? transferAmount : 0) + (lightest.name === 'R' ? transferAmount : 0);
  const simY = phaseY - (heaviest.name === 'Y' ? transferAmount : 0) + (lightest.name === 'Y' ? transferAmount : 0);
  const simB = phaseB - (heaviest.name === 'B' ? transferAmount : 0) + (lightest.name === 'B' ? transferAmount : 0);
  const simAvg = (simR + simY + simB) / 3;
  const simImbalance = simAvg > 0 ? (Math.max(Math.abs(simR - simAvg), Math.abs(simY - simAvg), Math.abs(simB - simAvg)) / simAvg) * 100 : 0;

  const chartData = [
    {
      name: 'Phase R',
      'Test Value (A)': Number(phaseR.toFixed(3)),
      'After Shift (A)': Number(simR.toFixed(3)),
    },
    {
      name: 'Phase Y',
      'Test Value (A)': Number(phaseY.toFixed(3)),
      'After Shift (A)': Number(simY.toFixed(3)),
    },
    {
      name: 'Phase B',
      'Test Value (A)': Number(phaseB.toFixed(3)),
      'After Shift (A)': Number(simB.toFixed(3)),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive Test Value Sandbox & Load Shift Diagnostics
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Change electrical readings below to see how PhaseGuard categorizes &ldquo;OK&rdquo; vs &ldquo;PROBLEM&rdquo; and why phase shifting is or isn&apos;t executed.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Test Presets:
          </span>
          <button
            onClick={() => applyPreset('ok')}
            className="px-2.5 py-1 rounded-lg font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition text-[11px]"
          >
            1. OK (Balanced)
          </button>
          <button
            onClick={() => applyPreset('moderate')}
            className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition text-[11px]"
          >
            2. Caution (7.8%)
          </button>
          <button
            onClick={() => applyPreset('severe')}
            className="px-2.5 py-1 rounded-lg font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition text-[11px]"
          >
            3. PROBLEM (18.2%)
          </button>
          <button
            onClick={() => applyPreset('drop')}
            className="px-2.5 py-1 rounded-lg font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition text-[11px]"
          >
            4. Phase Loss Drop
          </button>
        </div>
      </div>

      {/* Primary Diagnosis Hero: Clear "OK" vs "PROBLEM" Indicator */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          stateType === 'OK'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
            : stateType === 'WARNING'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
            : stateType === 'PHASE_LOSS'
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-100'
            : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                stateType === 'OK'
                  ? 'bg-emerald-500 text-white'
                  : stateType === 'WARNING'
                  ? 'bg-amber-500 text-white'
                  : stateType === 'PHASE_LOSS'
                  ? 'bg-purple-600 text-white'
                  : 'bg-rose-600 text-white animate-pulse'
              }`}
            >
              {stateType === 'OK' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : stateType === 'WARNING' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <AlertOctagon className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    stateType === 'OK'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : stateType === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : stateType === 'PHASE_LOSS'
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {stateType === 'OK'
                    ? 'HERE IT IS OK — NOMINAL OPERATION'
                    : stateType === 'WARNING'
                    ? 'CAUTION — MODERATE ASYMMETRY'
                    : stateType === 'PHASE_LOSS'
                    ? 'EMERGENCY PROBLEM — SINGLE PHASING LOSS'
                    : 'HERE IT IS A PROBLEM — SEVERE PHASE OVERLOAD'}
                </span>
                <span className="text-xs font-mono font-bold">
                  Imbalance: {imbalance.toFixed(2)}%
                </span>
              </div>

              {/* Explicit Explanation of WHY shifting is or isn't happening */}
              <div className="text-sm font-medium leading-relaxed pt-1">
                {stateType === 'OK' && (
                  <p>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Why shifting is NOT happening:
                    </strong>{' '}
                    The phase currents (R: {phaseR.toFixed(2)}A, Y: {phaseY.toFixed(2)}A, B:{' '}
                    {phaseB.toFixed(2)}A) are already balanced within normal IEC 61000 limits (&lt;5%).
                    Executing load switching on balanced branch lines would cause unnecessary mechanical
                    contactor wear, transient arcing, and momentary voltage dips with{' '}
                    <strong>zero electrical gain</strong>. Therefore, PhaseGuard intentionally{' '}
                    <strong>inhibits shifting</strong> and recommends continued monitoring.
                  </p>
                )}

                {stateType === 'WARNING' && (
                  <p>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">
                      Why shifting IS recommended:
                    </strong>{' '}
                    Phase {heaviest.name} ({heaviest.val.toFixed(2)}A) is carrying an elevated load
                    while Phase {lightest.name} ({lightest.val.toFixed(2)}A) has excess thermal
                    headroom. Shifting {transferAmount > 0 ? transferAmount.toFixed(2) : '0.12'}A from
                    Phase {heaviest.name} to Phase {lightest.name} reduces the imbalance from{' '}
                    <strong>{imbalance.toFixed(2)}% down to {simImbalance.toFixed(2)}%</strong>,
                    lowering neutral losses and preserving motor insulation life.
                  </p>
                )}

                {stateType === 'PROBLEM' && (
                  <p>
                    <strong className="text-rose-600 dark:text-rose-400 font-bold">
                      CRITICAL PROBLEM — Immediate Shifting Required:
                    </strong>{' '}
                    Extreme unbalance ({imbalance.toFixed(2)}%) detected! Phase {heaviest.name} is
                    operating near trip thresholds. This level of asymmetry causes dangerous negative-sequence
                    torques in electric motors, severe neutral conductor overheating, and nuisance breaker trips.
                    PhaseGuard advises shifting {transferAmount > 0 ? transferAmount.toFixed(2) : '0.35'}A
                    from Phase {heaviest.name} to {lightest.name} immediately.
                  </p>
                )}

                {stateType === 'PHASE_LOSS' && (
                  <p>
                    <strong className="text-purple-600 dark:text-purple-400 font-bold">
                      EMERGENCY PROBLEM — Shifting is LOCKOUT INHIBITED:
                    </strong>{' '}
                    A phase current has dropped below 0.5A (single-phasing condition). Shifting is{' '}
                    <strong>STRICTLY LOCKED OUT</strong> because transferring loads to an open or grounded
                    phase would induce an arc flash or severe line-to-line short circuit. Disconnect the feeder
                    and inspect upstream supply fuses immediately.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white/70 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[140px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Imbalance
            </div>
            <div
              className={`text-2xl font-black font-mono mt-0.5 ${
                stateType === 'OK'
                  ? 'text-emerald-500'
                  : stateType === 'WARNING'
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            >
              {imbalance.toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">IEC Target: &lt; 5.0%</div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Visual Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sliders to change test values (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Adjust Three-Phase Electrical Test Amperes:
          </h4>

          {/* Phase R Slider */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-red-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Phase R Current:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {phaseR.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="3.00"
              step="0.01"
              value={phaseR}
              onChange={(e) => setPhaseR(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.10 A</span>
              <span>1.50 A</span>
              <span>3.00 A</span>
            </div>
          </div>

          {/* Phase Y Slider */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Phase Y Current:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {phaseY.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="3.00"
              step="0.01"
              value={phaseY}
              onChange={(e) => setPhaseY(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.10 A</span>
              <span>1.50 A</span>
              <span>3.00 A</span>
            </div>
          </div>

          {/* Phase B Slider */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Phase B Current:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {phaseB.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="3.00"
              step="0.01"
              value={phaseB}
              onChange={(e) => setPhaseB(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.10 A</span>
              <span>1.50 A</span>
              <span>3.00 A</span>
            </div>
          </div>

          {/* Transfer Amount Slider */}
          {stateType !== 'OK' && stateType !== 'PHASE_LOSS' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  Simulate Shifting Load (Phase {heaviest.name} → Phase {lightest.name}):
                </span>
                <span className="font-mono font-bold text-blue-900 dark:text-blue-200">
                  {transferAmount.toFixed(2)} A
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.50"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400">
                <span>Resulting Imbalance: <strong>{simImbalance.toFixed(2)}%</strong></span>
                <span>
                  {simImbalance < imbalance ? `↓ ${(imbalance - simImbalance).toFixed(2)}% Improvement` : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Dynamic Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Phase Vector Dynamics & Shift Impact
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stateType === 'OK'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : stateType === 'WARNING'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {stateType === 'OK' ? 'Balanced Status' : 'Asymmetry Detected'}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#64748B" tickLine={false} />
                <YAxis fontSize={10} stroke="#64748B" tickLine={false} domain={[0, 3.2]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Test Value (A)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                {stateType !== 'OK' && stateType !== 'PHASE_LOSS' && (
                  <Bar dataKey="After Shift (A)" fill="#10B981" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Red Phase (R) • Yellow Phase (Y) • Blue Phase (B)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Average Load: {avg.toFixed(2)} A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

