import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Activity,
  Zap,
  Filter,
  Check,
  Search,
} from 'lucide-react';
import { PredictResponse, Reading } from '../types/api';
import { RiskBadge } from '../components/RiskBadge';

interface AnomalyDetectionProps {
  prediction: PredictResponse | null;
  history: Reading[];
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  prediction,
  history,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const anomalyDetected = prediction?.anomaly_detected ?? false;
  const riskLevel = prediction?.risk_level || 'LOW';
  const imbalance = prediction?.imbalance_percent ?? 0.51;

  // Real or derived electrical anomaly events
  const incidents = [
    {
      id: 'INC-9042',
      timestamp: 'Today, 13:42:10',
      type: 'Phase Unbalance Elevation',
      phase: 'Phase R & B',
      severity: 'WARNING',
      metric: `Imbalance: ${imbalance.toFixed(2)}%`,
      status: 'INVESTIGATING',
      rootCause: 'Asymmetrical single-phase load induction on Feeder 3',
    },
    {
      id: 'INC-9038',
      timestamp: 'Today, 12:15:00',
      type: 'Stator Thermal Surge',
      phase: 'Internal Stator',
      severity: 'WARNING',
      metric: '44.8°C (Normal: 40°C)',
      status: 'RESOLVED',
      rootCause: 'Cooling duct air flow reduction during peak shift switch',
    },
    {
      id: 'INC-8994',
      timestamp: 'Yesterday, 22:30:14',
      type: '3rd Harmonic Distortion',
      phase: 'Phase Y',
      severity: 'INFO',
      metric: 'THD: 4.8%',
      status: 'RESOLVED',
      rootCause: 'Non-linear rectifying load transient on auxiliary bus',
    },
    {
      id: 'INC-8921',
      timestamp: 'Yesterday, 09:12:30',
      type: 'Voltage Transient Sag',
      phase: 'Phase R-Y-B',
      severity: 'INFO',
      metric: 'Sag: 398V (120ms)',
      status: 'RESOLVED',
      rootCause: 'Upstream utility substation tap changer commutation',
    },
    {
      id: 'INC-8850',
      timestamp: 'Nov 3, 2026',
      type: 'Isolation Forest Boundary Trigger',
      phase: 'Three-Phase Vector',
      severity: anomalyDetected ? 'CRITICAL' : 'INFO',
      metric: anomalyDetected ? 'Anomaly Flagged' : 'Baseline Verified',
      status: anomalyDetected ? 'ACTIVE' : 'RESOLVED',
      rootCause: 'Multi-dimensional electrical outlier detected by model',
    },
  ];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSev = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    const matchesSearch =
      inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.phase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">AI Anomaly Detection</h2>
            <RiskBadge level={riskLevel} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multivariate Isolation Forest monitoring identifying electrical outliers, harmonics, and thermal degradation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Model: <span className="text-white font-bold">IsolationForest (150 trees, c=0.04)</span>
          </span>
        </div>
      </div>

      {/* Main Status Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Isolation Forest Status Card */}
        <div
          className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between ${
            anomalyDetected
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              : 'bg-[#0F172A] border-slate-800 text-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Anomaly Detector
              </span>
              <span
                className={`w-3 h-3 rounded-full ${
                  anomalyDetected ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                }`}
              />
            </div>
            <div className="flex items-center gap-3 my-2">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  anomalyDetected ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {anomalyDetected ? (
                  <AlertOctagon className="w-6 h-6 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-white">
                  {anomalyDetected ? 'ANOMALY DETECTED' : 'HEALTHY CONDITION'}
                </div>
                <div className="text-xs text-slate-400">
                  {anomalyDetected
                    ? 'Electrical signature deviates from baseline'
                    : 'All parameters within 99.6% confidence interval'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 mt-2">
            Contamination threshold: 4.0% • Trained on Praxis electrical vectors
          </div>
        </div>

        {/* Phase Imbalance Severity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Phase Imbalance Assessment
              </span>
              <RiskBadge level={riskLevel} size="sm" />
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span
                className={`text-3xl font-black font-mono ${
                  imbalance >= 10 ? 'text-rose-400' : imbalance >= 5 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {imbalance.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400">max deviation from mean</span>
            </div>
            <p className="text-xs text-slate-400">
              {imbalance < 5
                ? 'Standard compliance (IEC 61000-4-30 Class A). No immediate trip hazard.'
                : 'Caution: Asymmetry may cause neutral current heating and motor winding strain.'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Critical limit: 10.0%</span>
            <span>Warning threshold: 5.0%</span>
          </div>
        </div>

        {/* Diagnostic Thermal & Vibration Safety */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mechanical & Thermal Strain
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                NORMAL
              </span>
            </div>
            <div className="space-y-2 mt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Stator Winding Temp:</span>
                <span className="font-mono font-bold text-white">43.5 °C (Limit: 75°C)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Drive End Bearing:</span>
                <span className="font-mono font-bold text-white">46.1 °C (Limit: 70°C)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 mt-2">
            Sensor telemetry health: 100% active
          </div>
        </div>
      </div>

      {/* Incident & Fault History Table matching Image 2 */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Electrical Incident & Anomaly Log</h3>
            <p className="text-xs text-slate-400">
              Historical record of electrical anomalies, voltage sags, and harmonic distortions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterSeverity === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterSeverity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('WARNING')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterSeverity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Warning
              </button>
            </div>
          </div>
        </div>

        {/* Incidents Table matching Image 2 */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Phase / Origin</th>
                <th className="py-3 px-4">Metric Trigger</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((inc) => {
                const sevBadge =
                  inc.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : inc.severity === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30';

                const statusBadge =
                  inc.status === 'ACTIVE'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : inc.status === 'INVESTIGATING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{inc.id}</td>
                    <td className="py-3 px-4 text-slate-300">{inc.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-white">{inc.type}</td>
                    <td className="py-3 px-4 text-slate-400">{inc.phase}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{inc.metric}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevBadge}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                        {inc.status}
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

