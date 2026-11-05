import React from 'react';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  AlertOctagon,
  Sliders,
  BarChart3,
  Cpu,
  Sparkles,
  Zap,
  Server,
  HelpCircle,
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'live-monitoring'
  | 'forecasting'
  | 'anomaly'
  | 'load-optimization'
  | 'reports'
  | 'devices'
  | 'splash';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isConnected: boolean;
  modelReady: boolean;
  onOpenConnectionModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isConnected,
  modelReady,
  onOpenConnectionModal,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Activity, badge: 'LIVE' },
    { id: 'forecasting', label: 'AI Forecasting', icon: TrendingUp, badge: '30m' },
    { id: 'anomaly', label: 'Anomaly Detection', icon: AlertOctagon, badge: null },
    { id: 'load-optimization', label: 'Load Optimisation', icon: Sliders, badge: 'AI' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'devices', label: 'Devices & Sensors', icon: Cpu, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#0A101D] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-900/30 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-wider text-white">
                  PHASE<span className="text-blue-400">GUARD</span>
                </span>
              </div>
              {/* Three-Phase R-Y-B Accent Line */}
              <div className="flex h-1 w-full rounded-full overflow-hidden mt-1 gap-0.5">
                <div className="w-1/3 bg-red-500" title="Phase R (Red)" />
                <div className="w-1/3 bg-amber-400" title="Phase Y (Yellow)" />
                <div className="w-1/3 bg-blue-500" title="Phase B (Blue)" />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-2.5">
            Intelligent Power Monitoring
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Navigation
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as TabKey)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'LIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Splash Trigger */}
      <div className="p-3 space-y-2 border-t border-slate-800/80">
        <button
          onClick={() => onSelectTab('splash')}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'splash'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hero Splash Screen</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">View</span>
        </button>

        {/* Backend Connection status */}
        <div
          onClick={onOpenConnectionModal}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
          title="Click to configure backend API URL"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition" />
              <span className="text-xs font-semibold text-slate-300">FastAPI Backend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className={`text-[10px] font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: {modelReady ? 'RF + IsoForest' : 'Loading...'}</span>
            <span className="text-blue-400 group-hover:underline">Settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

