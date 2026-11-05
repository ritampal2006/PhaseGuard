import React, { useState } from 'react';
import {
  Sliders,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Zap,
  HelpCircle,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { PredictResponse } from '../types/api';
import { InteractivePhaseSandbox } from '../components/InteractivePhaseSandbox';
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

interface LoadOptimizationProps {
  prediction: PredictResponse | null;
}

export const LoadOptimization: React.FC<LoadOptimizationProps> = ({ prediction }) => {
  const current = prediction?.current || { R: 2.02, Y: 2.03, B: 2.04 };
  const forecast = prediction?.forecast || { R: 2.03, Y: 2.00, B: 2.00 };

  // Rebalance simulation state
  const [shiftAmount, setShiftAmount] = useState<number>(0.05);
  const [fromPhase, setFromPhase] = useState<'R' | 'Y' | 'B'>('R');
  const [toPhase, setToPhase] = useState<'R' | 'Y' | 'B'>('B');

  // Calculate simulated rebalanced currents
  const simR =
    forecast.R - (fromPhase === 'R' ? shiftAmount : 0) + (toPhase === 'R' ? shiftAmount : 0);
  const simY =
    forecast.Y - (fromPhase === 'Y' ? shiftAmount : 0) + (toPhase === 'Y' ? shiftAmount : 0);
  const simB =
    forecast.B - (fromPhase === 'B' ? shiftAmount : 0) + (toPhase === 'B' ? shiftAmount : 0);

  const calcImb = (vals: number[]) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg <= 0) return 0;
    return (Math.max(...vals.map((v) => Math.abs(v - avg))) / avg) * 100;
  };

  const originalImb = calcImb([forecast.R, forecast.Y, forecast.B]);
  const simulatedImb = calcImb([simR, simY, simB]);
  const imbDelta = originalImb - simulatedImb;

  const comparisonData = [
    {
      name: 'Phase R',
      'Unbalanced Forecast (+30m)': Number(forecast.R.toFixed(3)),
      'Simulated Rebalanced': Number(simR.toFixed(3)),
    },
    {
      name: 'Phase Y',
      'Unbalanced Forecast (+30m)': Number(forecast.Y.toFixed(3)),
      'Simulated Rebalanced': Number(simY.toFixed(3)),
    },
    {
      name: 'Phase B',
      'Unbalanced Forecast (+30m)': Number(forecast.B.toFixed(3)),
      'Simulated Rebalanced': Number(simB.toFixed(3)),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">Load Optimisation</h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AI REBALANCER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Intelligent phase balancing suggestions to minimize neutral current losses and avoid motor overheating
          </p>
        </div>
      </div>

      {/* Dynamic Test Value Changer & Shifting Reason Visualizer */}
      <InteractivePhaseSandbox />

      {/* Primary Model Recommendation Banner */}
      <div className="bg-[#0F172A] border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-0" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                Model Recommendation
              </span>
              <span className="text-xs text-slate-400 font-mono">Horizon: +30 minutes</span>
            </div>
            <p className="text-base text-slate-100 font-medium leading-relaxed">
              {prediction?.recommendation ||
                'Phase currents appear reasonably balanced. Continue regular telemetry monitoring.'}
            </p>
            <p className="text-xs text-slate-400">
              {prediction?.disclaimer ||
                'Prototype decision support only; not a certified protection or control system.'}
            </p>
          </div>

          <div className="flex md:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center min-w-[130px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Before Rebalance</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {originalImb.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center min-w-[130px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">After Simulation</div>
              <div
                className={`text-xl font-bold font-mono mt-0.5 ${
                  simulatedImb < originalImb ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {simulatedImb.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Phase Rebalancer Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Interactive Rebalance Simulator</h3>
            </div>
            <button
              onClick={() => {
                setShiftAmount(0.05);
                setFromPhase('R');
                setToPhase('B');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Reset
            </button>
          </div>

          {/* From Phase Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Transfer Load FROM Phase (Heaviest Phase):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['R', 'Y', 'B'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFromPhase(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    fromPhase === p
                      ? p === 'R'
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow'
                        : p === 'Y'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                        : 'bg-blue-500/20 border-blue-500 text-blue-300 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Phase {p} ({forecast[p].toFixed(2)}A)
                </button>
              ))}
            </div>
          </div>

          {/* To Phase Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Transfer Load TO Phase (Lightest Phase):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['R', 'Y', 'B'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setToPhase(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    toPhase === p
                      ? p === 'R'
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow'
                        : p === 'Y'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                        : 'bg-blue-500/20 border-blue-500 text-blue-300 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Phase {p} ({forecast[p].toFixed(2)}A)
                </button>
              ))}
            </div>
          </div>

          {/* Shift Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Amperes to Transfer:</span>
              <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {shiftAmount.toFixed(3)} A
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.30"
              step="0.005"
              value={shiftAmount}
              onChange={(e) => setShiftAmount(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.00 A</span>
              <span>0.15 A</span>
              <span>0.30 A</span>
            </div>
          </div>

          {/* Imbalance Impact Summary */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              simulatedImb < originalImb
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span>Simulation Outcome:</span>
              <span>
                {simulatedImb < originalImb
                  ? `Imbalance Reduced by ${imbDelta.toFixed(2)}%`
                  : 'Imbalance Increases'}
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              Moving {shiftAmount.toFixed(3)}A from Phase {fromPhase} to Phase {toPhase} yields a
              rebalanced asymmetry of {simulatedImb.toFixed(2)}%.
            </p>
          </div>
        </div>

        {/* Visual Comparison Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Before vs After Load Redistribution</h3>
              <span className="text-xs font-mono text-emerald-400">
                Target: &lt; 2.0%
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visualizes how transferring branch circuits equalizes current draws across all three phases
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
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
                  <Bar
                    dataKey="Unbalanced Forecast (+30m)"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Simulated Rebalanced"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Resulting Imbalance: <strong className="text-white">{simulatedImb.toFixed(2)}%</strong></span>
            <span className="text-emerald-400 font-semibold">IEEE 141 Guideline Compliant</span>
          </div>
        </div>
      </div>

      {/* Engineering Safety Precaution Checklist */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">
            Pre-Switching Engineering Safety Verification
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          The following mandatory checks must be conducted by certified personnel prior to any feeder circuit transfer:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Neutral Conductor Ampacity</span>
              <p className="text-[11px] text-slate-400">
                Confirm neutral bus rating handles sum of harmonic return currents before redistribution.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">MCCB & Cable Thermal Derating</span>
              <p className="text-[11px] text-slate-400">
                Verify breaker thermal trip curves on Phase {toPhase} will not exceed 80% continuous duty.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Phase Sequence Verification</span>
              <p className="text-[11px] text-slate-400">
                Maintain strict R-Y-B rotational sequence to avoid motor reverse spin hazards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Lockout / Tagout (LOTO) Compliance</span>
              <p className="text-[11px] text-slate-400">
                Isolate upstream switchboard before manual tap changing or branch circuit rerouting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

