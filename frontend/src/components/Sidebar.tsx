import React from 'react';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  AlertOctagon,
  Sliders,
  BarChart3,
  Cpu,
  Zap,
  Diamond,
  ChevronRight,
  ChevronDown,
  Layers,
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
    <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none z-20 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Brand Header matching FinEdge */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0D9488] flex items-center justify-center shadow-md shadow-[#0D9488]/20 text-white font-black text-xl">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Phase<span className="text-[#0D9488]">Guard</span>
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" title="Phase R" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" title="Phase Y" />
                  <div className="w-2 h-2 rounded-full bg-blue-500" title="Phase B" />
                  <span className="text-[10px] text-slate-400 font-medium ml-1">Grid Sentry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items with FinEdge rounded pill styling */}
          <nav className="px-4 py-2 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as TabKey)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF] shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-[#0D9488] dark:text-[#2DD4BF]'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#0D9488]/15 text-[#0D9488] dark:text-[#2DD4BF]'
                          : item.badge === 'LIVE'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick link to Splash Screen */}
            <button
              onClick={() => onSelectTab('splash')}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                currentTab === 'splash'
                  ? 'bg-[#E6F4F1] text-[#0D9488]'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Splash Showcase</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Promo Card & Alex Roy Profile (FinEdge exact replication) */}
        <div className="p-4 space-y-3">
          {/* Upgrade to Auto-Guard Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0F8F7] to-[#E5F3F1] dark:from-[#132230] dark:to-[#0F1E2A] border border-[#D5ECE8] dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#0D9488] shadow-sm">
                <Diamond className="w-3.5 h-3.5 fill-[#0D9488]" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Upgrade to Auto-Guard
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-3">
              Unlock automatic breaker trip relays and high-frequency harmonics limits.
            </p>
            <button
              onClick={onOpenConnectionModal}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-md shadow-[#0D9488]/20 transition group"
            >
              <span>Auto-Guard Pro</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          {/* Alex Roy User Profile */}
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#0D9488]/15 text-[#0D9488] dark:text-[#2DD4BF] font-black text-xs flex items-center justify-center border border-[#0D9488]/30">
                AR
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  Alex Roy
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Chief Grid Engineer
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
