import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Clock,
  ShieldCheck,
  Server,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onRefreshDemo: () => void;
  isLoading: boolean;
  isConnected: boolean;
  onOpenSettings: () => void;
  alertCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefreshDemo,
  isLoading,
  isConnected,
  onOpenSettings,
  alertCount,
  isDarkMode,
  onToggleTheme,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('en-US', { hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between shrink-0 select-none z-10 transition-colors">
      {/* Search Bar matching Image 2 */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search phases, telemetry, faults, metrics..."
            className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right side widgets */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span className="font-mono text-[11px]">{timeStr || 'Syncing...'}</span>
        </div>

        {/* Dark / Light Mode Switch */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Live Backend Status */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
          }`}
          title="Click to check or update API endpoint"
        >
          <Server className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isConnected ? 'API: Connected' : 'API: Disconnected'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
        </button>

        {/* Quick Demo Refresh Button */}
        <button
          onClick={onRefreshDemo}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          title="Run /demo prediction with latest sample readings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Run Inference</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            <Bell className="w-4 h-4" />
          </button>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0B1120]">
              {alertCount}
            </span>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-blue-500/20">
              KA
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B1120]" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200">Koyinsola Adeyemi</div>
            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span>Plant Chief Engineer</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
