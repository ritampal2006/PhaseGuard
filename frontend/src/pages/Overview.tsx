import React from 'react';
import {
  Zap,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Plus,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { usePower } from '../context/PowerContext';
import { TabKey } from '../components/Sidebar';

interface OverviewProps {
  onNavigateTab: (tab: TabKey) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigateTab }) => {
  const {
    phaseR,
    phaseY,
    phaseB,
    phaseR_Volt,
    phaseY_Volt,
    phaseB_Volt,
    totalActivePower,
    neutralCurrent,
    imbalance,
    recommendation,
    dateRangeText,
    weeklyTrend,
    recentEvents,
    updatePhaseCurrents,
    applyPreset,
    activePreset,
  } = usePower();

  // Category Donut Data (Phase load split)
  const donutData = [
    { name: 'Phase R Load', value: 1620.5, color: '#0D9488', pct: '37.5%' },
    { name: 'Phase Y Load', value: 1120.3, color: '#06B6D4', pct: '25.9%' },
    { name: 'Phase B Load', value: 780.4, color: '#3B82F6', pct: '18.1%' },
    { name: 'Neutral Drift', value: 560.0, color: '#8B5CF6', pct: '13.0%' },
    { name: 'Auxiliary Bus', value: 239.0, color: '#94A3B8', pct: '5.5%' },
  ];

  // Helper for status diagnostics
  const isSinglePhasing = phaseR < 0.5 || phaseY < 0.5 || phaseB < 0.5;
  const isNominal = !isSinglePhasing && imbalance < 2.0;
  const isModerate = !isSinglePhasing && imbalance >= 2.0 && imbalance < 10.0;
  const isSevere = !isSinglePhasing && imbalance >= 10.0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* =========================================================================
          ROW 1: 5 FinEdge Top KPI Cards
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Grid Power */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] dark:bg-[#0D9488]/20 flex items-center justify-center text-[#0D9488]">
              <Zap className="w-5 h-5 fill-[#0D9488]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Grid Load</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                ${totalActivePower.toFixed(2)}k kW
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>12.5%</span>
            <span className="text-slate-400 font-normal">vs last 7 days</span>
          </div>
        </div>

        {/* Card 2: Phase Current Avg */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Phase Current Avg</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                {(((phaseR + phaseY + phaseB) / 3) * 4400).toFixed(2)} A
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8.1%</span>
            <span className="text-slate-400 font-normal">vs last 7 days</span>
          </div>
        </div>

        {/* Card 3: Neutral Drift */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Neutral Drift</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                {(neutralCurrent * 1000).toFixed(2)} mA
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>6.4%</span>
            <span className="text-slate-400 font-normal">favorable drift</span>
          </div>
        </div>

        {/* Card 4: Phase Symmetry */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Phase Symmetry</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                {(100 - imbalance).toFixed(1)}%
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>10.2%</span>
            <span className="text-slate-400 font-normal">vs last 7 days</span>
          </div>
        </div>

        {/* Card 5: Grid Stability Index */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Grid Stability</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                99.4%
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>10.2%</span>
            <span className="text-slate-400 font-normal">frequency 50.0Hz</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: Clean 2-Column Section (Balance Overview REMOVED as requested)
          - Left (6 cols): Phase Load Distribution Donut Chart
          - Right (6 cols): Recent Electrical Events List
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Phase Load Distribution Donut (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Phase Load Distribution by Category
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Current active power split across R, Y, B conductors & neutral drift
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#0D9488] bg-[#E6F4F1] dark:bg-[#0D9488]/20 px-3 py-1 rounded-full">
              {dateRangeText}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 my-auto pt-2">
            {/* Donut Chart with Center Total */}
            <div className="md:col-span-6 relative h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                  $4,320.20
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  kW Total
                </span>
              </div>
            </div>

            {/* Legend Breakdown Items */}
            <div className="md:col-span-6 space-y-2.5">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-mono font-bold">
                    ${item.value.toFixed(2)} ({item.pct})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Electrical Events List (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Recent Electrical Transactions & Events
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated grid balance actions, trips, and transient logs
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-[#0D9488] font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          {/* Event Items List */}
          <div className="space-y-3 mt-1">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold ${
                      evt.type === 'positive'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : evt.type === 'negative'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {evt.category === 'balance' ? '⚡' : evt.category === 'surge' ? '⚠️' : '📊'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">
                      {evt.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {evt.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold font-mono ${
                    evt.type === 'positive'
                      ? 'text-emerald-600'
                      : evt.type === 'negative'
                      ? 'text-rose-500'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {evt.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: Bottom Section (Digital Card, Crypto/Telemetry List, Cash Flow Bar Chart)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: My Cards (Feeder Breaker Digital Card) (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              My Cards
            </h4>
            <button
              onClick={() => onNavigateTab('devices')}
              className="text-xs text-[#0D9488] font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* The FinEdge Teal Credit Card */}
            <div className="flex-1 bg-gradient-to-tr from-[#0F766E] via-[#0D9488] to-[#14B8A6] rounded-2xl p-4 text-white shadow-lg shadow-[#0D9488]/20 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-8 h-6 bg-amber-200/90 rounded-md border border-amber-300 shadow-inner" />
                <span className="font-extrabold text-sm tracking-wider opacity-90">VISA</span>
              </div>

              <p className="font-mono text-base tracking-widest font-semibold mb-4 text-white/90">
                •••• •••• •••• 4242
              </p>

              <div className="flex justify-between items-end text-[10px]">
                <div>
                  <p className="opacity-60 uppercase text-[8px] font-semibold">Engineer</p>
                  <p className="font-bold">Alex Roy</p>
                </div>
                <div>
                  <p className="opacity-60 uppercase text-[8px] font-semibold">Expires</p>
                  <p className="font-bold">08/28</p>
                </div>
              </div>
            </div>

            {/* Add New Card / Feeder Button */}
            <div
              onClick={() => onNavigateTab('devices')}
              className="w-24 h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0D9488] flex flex-col items-center justify-center p-2 text-center cursor-pointer transition group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-[#0D9488] group-hover:text-white transition">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                Add New Card
              </span>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            <div className="w-2 h-2 rounded-full bg-[#0D9488]" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>

        {/* Center: Crypto Portfolio / Phase Vector Telemetry (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Crypto Portfolio
            </h4>
            <button
              onClick={() => onNavigateTab('live-monitoring')}
              className="text-xs text-[#0D9488] font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {/* USDT / Phase R */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center font-bold text-xs">
                  ₮
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Phase R (Red)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {phaseR.toFixed(2)} A • {phaseR_Volt} V
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1,240.50 kW
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 1.2%
                </p>
              </div>
            </div>

            {/* BTC / Phase Y */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-bold text-xs">
                  ₿
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Phase Y (Yellow)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {phaseY.toFixed(2)} A • {phaseY_Volt} V
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2,856.45 kW
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 2.3%
                </p>
              </div>
            </div>

            {/* ETH / Phase B */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                  Ξ
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Phase B (Blue)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {phaseB.toFixed(2)} A • {phaseB_Volt} V
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2,125.30 kW
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 1.8%
                </p>
              </div>
            </div>

            {/* BNB / Neutral Bus */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 flex items-center justify-center font-bold text-xs">
                  ◈
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Neutral Bus
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {neutralCurrent.toFixed(2)} A • 3.2% THD
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1,104.25 kW
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 0.9%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cash Flow Bi-Directional Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cash Flow</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  $4,605.20 kW
                </span>
                <span className="flex items-center text-xs text-emerald-600 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 10.2%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>This Week</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-semibold mb-3">
            <span className="flex items-center gap-1 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-[#0D9488]" /> Inflow (Gen)
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-rose-400" /> Outflow (Load)
            </span>
          </div>

          {/* Diverging Bar Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}k`}
                />
                <ReferenceLine y={0} stroke="#CBD5E1" />
                <Bar dataKey="inflow" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="#FB7185" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: Interactive Phase Sandbox ("Test Value Changing" - Demonstrates OK vs PROBLEM)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0D9488]" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Interactive Phase Sandbox & Fault Injector
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust phase currents or select presets below to test how PhaseGuard differentiates{' '}
              <strong className="text-emerald-600">Nominal OK</strong> from{' '}
              <strong className="text-rose-600">Problematic Overloads</strong> and prevents false shifting.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyPreset('balanced')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activePreset === 'balanced'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nominal (OK)</span>
            </button>

            <button
              onClick={() => applyPreset('moderate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activePreset === 'moderate'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Moderate (Caution)</span>
            </button>

            <button
              onClick={() => applyPreset('severe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activePreset === 'severe'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Severe (Problem)</span>
            </button>

            <button
              onClick={() => applyPreset('phase_loss')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activePreset === 'phase_loss'
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Single Phasing (Lockout)</span>
            </button>
          </div>
        </div>

        {/* Real-time Diagnostics Banner */}
        <div
          className={`mt-4 p-4 rounded-2xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isNominal
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : isModerate
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : isSevere
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
              : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {isNominal && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isModerate && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {isSevere && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {isSinglePhasing && <XCircle className="w-5 h-5 text-purple-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase">
                  {isNominal
                    ? 'State: Balanced (OK)'
                    : isModerate
                    ? 'State: Moderate Asymmetry (Actionable)'
                    : isSevere
                    ? 'State: Critical Overload (Breaker Armed)'
                    : 'State: Single-Phasing Emergency (Shift Locked Out)'}
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 border border-current">
                  Unbalance: {imbalance.toFixed(2)}%
                </span>
              </div>
              <p className="mt-1 font-medium leading-relaxed">{recommendation}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('load-optimization')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow transition"
            >
              Analyze in Load Optimizer →
            </button>
          </div>
        </div>

        {/* Phase Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Phase R Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Phase R (Red)
              </span>
              <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {phaseR.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.5"
              step="0.05"
              value={phaseR}
              onChange={(e) => updatePhaseCurrents(parseFloat(e.target.value), phaseY, phaseB)}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.10 A</span>
              <span>Nominal: 2.02 A</span>
              <span>3.50 A</span>
            </div>
          </div>

          {/* Phase Y Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Phase Y (Yellow)
              </span>
              <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {phaseY.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.5"
              step="0.05"
              value={phaseY}
              onChange={(e) => updatePhaseCurrents(phaseR, parseFloat(e.target.value), phaseB)}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.10 A</span>
              <span>Nominal: 2.03 A</span>
              <span>3.50 A</span>
            </div>
          </div>

          {/* Phase B Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B132B] border border-slate-200/80 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Phase B (Blue)
              </span>
              <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {phaseB.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.5"
              step="0.05"
              value={phaseB}
              onChange={(e) => updatePhaseCurrents(phaseR, phaseY, parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.10 A</span>
              <span>Nominal: 2.04 A</span>
              <span>3.50 A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Overview;
