import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  Zap,
} from 'lucide-react';
import { usePower } from '../context/PowerContext';

export const AnomalyDetection: React.FC = () => {
  const {
    phaseR,
    phaseY,
    phaseB,
    imbalance,
    riskLevel,
    anomalyDetected,
    recommendation,
    dateRangeText,
    lastUpdatedDate,
  } = usePower();

  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Incidents list using generic dates matching FinEdge style
  const incidents = [
    {
      id: 'INC-4201',
      date: 'May 18, 2024 • 14:10 UTC',
      type: 'Phase Unbalance Elevation',
      phase: 'Phase R & B',
      severity: riskLevel === 'HIGH' ? 'CRITICAL' : riskLevel === 'MEDIUM' ? 'WARNING' : 'INFO',
      metric: `Imbalance: ${imbalance.toFixed(2)}%`,
      status: anomalyDetected ? 'ACTIVE' : 'NORMALIZED',
      rootCause: recommendation,
    },
    {
      id: 'INC-4198',
      date: 'May 17, 2024 • 09:45 UTC',
      type: 'Stator Thermal Surge',
      phase: 'Internal Stator',
      severity: 'WARNING',
      metric: '44.8°C (Nominal: 40.0°C)',
      status: 'RESOLVED',
      rootCause: 'Cooling duct air flow reduction during peak shift switch',
    },
    {
      id: 'INC-4182',
      date: 'May 16, 2024 • 19:20 UTC',
      type: '3rd Harmonic Current Distortion',
      phase: 'Phase Y',
      severity: 'INFO',
      metric: 'THD: 3.8% (Limit: 5.0%)',
      status: 'RESOLVED',
      rootCause: 'Variable frequency drive non-linear switching noise',
    },
    {
      id: 'INC-4160',
      date: 'May 15, 2024 • 11:30 UTC',
      type: 'Line Voltage Sag',
      phase: 'Phase R-Y',
      severity: 'WARNING',
      metric: 'Sag: -12.4 V',
      status: 'RESOLVED',
      rootCause: 'Heavy 75kW induction motor direct-on-line start transient',
    },
  ];

  const filtered = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (searchQuery && !inc.type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Anomaly Detection & Fault Diagnostics
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                anomalyDetected
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200'
              }`}
            >
              {anomalyDetected ? 'ANOMALY DETECTED' : 'SYSTEM HEALTHY'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time isolation forest & autoencoder fault classification for three-phase power quality
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-slate-400">
          Last Check: {lastUpdatedDate}
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Active Faults</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
            {anomalyDetected ? '1 Critical' : '0 Active'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Continuous harmonic scan</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Unbalance Vector</p>
          <p className="text-3xl font-black text-[#0D9488] mt-1">
            {imbalance.toFixed(2)}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Threshold limit: 10.0%</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Incident History ({dateRangeText})</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
            {incidents.length} Logged
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">3 Auto-Mitigated</p>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Electrical Anomaly Log
          </h4>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    filterSeverity === sev
                      ? 'bg-white dark:bg-[#0F172A] text-[#0D9488] shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {filtered.map((item) => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                      : item.severity === 'WARNING'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.rootCause}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.metric}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AnomalyDetection;
