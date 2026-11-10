import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileText,
  Printer,
  TrendingUp,
  Activity,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { usePower } from '../context/PowerContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const { dateRangeText, weeklyTrend, imbalance, totalActivePower } = usePower();
  const [reportType, setReportType] = useState<'weekly' | 'daily' | 'compliance'>('weekly');

  const complianceSlices = [
    { name: 'Nominal Compliant (<2% Unbalance)', value: 88, color: '#0D9488' },
    { name: 'Permissible Asymmetry (2-5%)', value: 9, color: '#3B82F6' },
    { name: 'Actionable Events (>5%)', value: 3, color: '#EF4444' },
  ];

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Power Quality Analytics
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF]">
              IEC 60034 AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Downloadable engineering reports, weekly electrical trends, and power factor audits for {dateRangeText}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20 hover:bg-[#0F766E] transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Top 4 Compliance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Total Generation Inflow</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            29.8 MWh
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 4.2% vs previous week</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Average Imbalance</p>
          <p className="text-2xl font-black text-[#0D9488] mt-1">
            0.94%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Complies with IEC 60034-1</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Harmonic Distortion THD</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            3.2%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">IEEE 519 standard &lt; 5.0%</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-semibold text-slate-400">Energy Savings via Balancing</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            $1,420.50
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Neutral losses prevented</p>
        </div>
      </div>

      {/* Main Historical Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Weekly Active Load Trend ({dateRangeText})
              </h4>
              <p className="text-xs text-slate-400">
                Three-phase sum vs. calculated electrical unbalance ratio
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
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
                <Area type="monotone" dataKey="load" stroke="#0D9488" strokeWidth={3} fill="url(#reportTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Donut */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              Grid Compliance Ratio
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Hours spent in nominal vs. permissible bands
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complianceSlices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {complianceSlices.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{s.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportsAnalytics;
