import React from 'react';
import {
  Zap,
  ArrowRight,
  Shield,
  Activity,
  Cpu,
  BarChart2,
  Sliders,
  CheckCircle,
} from 'lucide-react';

interface SplashScreenProps {
  onEnterDashboard: () => void;
  isConnected: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnterDashboard,
  isConnected,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#0A0F1D]">
      {/* Hero Background Image with Industrial Tint */}
      <div className="absolute inset-0 z-0">
        <img
          src="/splash-hero.jpg"
          alt="PhaseGuard Industrial Electrical Control"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B19]/95 via-[#0A0F1D]/80 to-[#0B142E]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
      </div>

      {/* Main Content Hero matching Image 1 */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-12 pb-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand & Tagline matching Image 1 */}
          <div className="lg:col-span-8 space-y-6">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                {isConnected ? 'Industrial AI Online • v2.0' : 'Backend Standby • Ready'}
              </span>
            </div>

            {/* Title & Three-Phase Bar */}
            <div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase drop-shadow-xl">
                PHASE<span className="text-blue-400">GUARD</span>
              </h1>

              {/* Exact Red / Yellow / Blue Bar from Image 1 */}
              <div className="flex h-2.5 w-64 sm:w-96 rounded-full overflow-hidden mt-3 shadow-lg gap-1">
                <div className="w-1/3 bg-red-500" title="Phase R (Red)" />
                <div className="w-1/3 bg-amber-400" title="Phase Y (Yellow)" />
                <div className="w-1/3 bg-blue-500" title="Phase B (Blue)" />
              </div>

              {/* Tagline matching Image 1 */}
              <p className="text-2xl sm:text-3xl font-semibold italic text-slate-200 mt-4 tracking-tight drop-shadow">
                Predict the Imbalance. Prevent the Failure.
              </p>

              {/* Subtitle matching Image 1 */}
              <p className="text-xs sm:text-sm font-bold tracking-[0.35em] text-blue-300 uppercase mt-2">
                INTELLIGENT POWER MONITORING
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Industrial three-phase power monitoring powered by trained Random Forest regression
              and Isolation Forest anomaly detection. Real-time telemetry, 30-minute current
              forecasting, unbalance risk prevention, and intelligent phase load rebalancing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onEnterDashboard}
                className="group px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center gap-3 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Monitoring Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono bg-slate-900/60 backdrop-blur px-4 py-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Model:</span>
                <span className="text-emerald-400 font-bold">RandomForestRegressor (120 Trees)</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">MAE:</span>
                <span className="text-blue-400 font-bold">0.019A</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Industrial Specs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Core Capabilities
                  </span>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Three-Phase R/Y/B Monitoring</span>
                    <p className="text-[11px] text-slate-400">
                      Live Amperes, Volts, Frequency & THD harmonic telemetry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">30-Minute AI Forecasting</span>
                    <p className="text-[11px] text-slate-400">
                      Praxis multi-lag temporal regression anticipates overload 30m ahead.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Isolation Forest Anomaly</span>
                    <p className="text-[11px] text-slate-400">
                      Continuous electrical health evaluation with 0.04 contamination factor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Sliders className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Smart Load Redistribution</span>
                    <p className="text-[11px] text-slate-400">
                      Actionable phase balancing recommendations to prevent neutral overheating.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Data Source:</span>
                  <span className="text-slate-300">Praxis Crompton Greaves</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Specifications Strip */}
      <div className="relative z-10 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-sm py-4 px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Phase R (415V LL / 240V LN)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Phase Y (120° Displacement)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Phase B (Balanced Symmetrical)
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Grid Standard: IEC 61000-4-30</span>
            <span>•</span>
            <span>Horizon: 30 Min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

