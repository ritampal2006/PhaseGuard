import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Clock,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Zap,
  Check,
  CalendarDays,
} from 'lucide-react';
import { usePower, PRESET_DATE_RANGES, PresetDateOption } from '../context/PowerContext';

interface NavbarProps {
  onRefreshDemo: () => void;
  isLoading: boolean;
  isConnected: boolean;
  onOpenSettings: () => void;
  alertCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefreshDemo,
  isLoading,
  isConnected,
  onOpenSettings,
  alertCount,
  isDarkMode,
  onToggleTheme,
  title = 'Overview',
  subtitle = "Welcome back, Alex! Here's what's happening with your power grid today.",
}) => {
  const {
    secondsRemaining,
    triggerManualCollection,
    dateRangeText,
    changeDateRange,
    activeDateOptionId,
    lastSyncMessage,
  } = usePower();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState('2024-05-12');
  const [customEnd, setCustomEnd] = useState('2024-05-18');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    const startObj = new Date(customStart);
    const endObj = new Date(customEnd);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = startObj.toLocaleDateString('en-US', options);
    const endStr = endObj.toLocaleDateString('en-US', options);
    const yearStr = endObj.getFullYear();
    const label = `${startStr} – ${endStr}, ${yearStr}`;

    // Generate 7 days in range
    const days: string[] = [];
    const diffDays = Math.max(1, Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24)));
    const step = Math.max(1, Math.floor(diffDays / 6));
    for (let i = 0; i < 7; i++) {
      const d = new Date(startObj.getTime() + i * step * (1000 * 3600 * 24));
      days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    changeDateRange({ label, days });
    setDateDropdownOpen(false);
  };

  return (
    <header className="bg-transparent px-8 pt-6 pb-2 shrink-0 select-none z-30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Personalized Greeting */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Right: Controls (Search, Bell, Interactive Date Range Picker, 2-Min Countdown, Theme) */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Search Pill */}
          <div className="relative w-48 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-full pl-9 pr-14 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#0D9488] transition"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-400 font-mono">
              Ctrl+K
            </div>
          </div>

          {/* Bell Notification with teal badge */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#0D9488] transition relative"
            title="Notification alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0D9488] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
              {alertCount > 0 ? alertCount : 3}
            </span>
          </button>

          {/* INTERACTIVE DATE RANGE SELECTOR (Matches FinEdge Image & Allows Changing Dates) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-xs text-slate-700 dark:text-slate-200 font-medium hover:border-[#0D9488] hover:shadow-md transition cursor-pointer"
              title="Click to change date range"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="font-semibold">{dateRangeText}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform ${
                  dateDropdownOpen ? 'rotate-180 text-[#0D9488]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {dateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                    <CalendarDays className="w-4 h-4 text-[#0D9488]" />
                    <span>Select Timeframe</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Audit Period</span>
                </div>

                {/* Preset Options List */}
                <div className="space-y-1">
                  {PRESET_DATE_RANGES.map((opt: PresetDateOption) => {
                    const isSelected = activeDateOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          changeDateRange(opt);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                          isSelected
                            ? 'bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF] font-bold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0D9488]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Range Picker Inputs */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Custom Date Range
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0D9488]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApplyCustom}
                    className="w-full mt-1 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow transition"
                  >
                    Apply Custom Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2-Minute Auto-Collection Cycle Badge & Manual Trigger */}
          <div className="flex items-center gap-1.5 bg-[#E6F4F1] dark:bg-[#0D9488]/20 border border-[#0D9488]/30 rounded-full px-3.5 py-1.5 text-xs text-[#0D9488] dark:text-[#2DD4BF] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-[11px] font-mono tracking-tight">
              Cycle: {formatSeconds(secondsRemaining)}
            </span>
            <button
              onClick={triggerManualCollection}
              className="ml-1 p-1 hover:bg-[#0D9488]/20 rounded-full transition"
              title="Click to force telemetry data collection immediately"
            >
              <RefreshCw className="w-3 h-3 text-[#0D9488]" />
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#0D9488] transition"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#0D9488]" />
            )}
          </button>
        </div>
      </div>

      {/* Real-time Ingestion & Date Update Notification Banner */}
      {lastSyncMessage && (
        <div className="mt-3 py-1.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">{lastSyncMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            Synchronized
          </span>
        </div>
      )}
    </header>
  );
};
