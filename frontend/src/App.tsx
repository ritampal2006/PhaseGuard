import React, { useState } from 'react';
import { Sidebar, TabKey } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ConnectionModal } from './components/ConnectionModal';
import { SplashScreen } from './pages/SplashScreen';
import { Overview } from './pages/Overview';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { AIForecasting } from './pages/AIForecasting';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { LoadOptimization } from './pages/LoadOptimization';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { DevicesSensors } from './pages/DevicesSensors';
import { PowerProvider, usePower } from './context/PowerContext';

const TAB_METADATA: Record<TabKey, { title: string; subtitle: string }> = {
  splash: {
    title: 'PhaseGuard Showcase',
    subtitle: 'Predict the Imbalance. Prevent the Failure.',
  },
  overview: {
    title: 'Overview',
    subtitle: "Welcome back, Alex! Here's what's happening with your power grid today.",
  },
  'live-monitoring': {
    title: 'Live Monitoring',
    subtitle: 'Real-time R/Y/B current, voltage, frequency and electrical telemetry readings.',
  },
  forecasting: {
    title: 'AI Forecasting',
    subtitle: '30-minute current predictions and future phase imbalance trajectory.',
  },
  anomaly: {
    title: 'Anomaly Detection',
    subtitle: 'Abnormal wave patterns, overload warnings and fault indicators.',
  },
  'load-optimization': {
    title: 'Load Optimisation',
    subtitle: 'Suggestions and root causes to redistribute loads between R, Y and B phases.',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Historical trends, compliance ratios and downloadable electrical reports.',
  },
  devices: {
    title: 'Devices & Sensors',
    subtitle: 'Connected meters, sensor channels, device details and data connection.',
  },
};

const DashboardContent: React.FC = () => {
  // Splash screen shown first as requested: "splace screen first then then thius website starts"
  const [currentTab, setCurrentTab] = useState<TabKey>('splash');
  const [connectionModalOpen, setConnectionModalOpen] = useState<boolean>(false);
  const { isDarkMode, toggleTheme, anomalyDetected, triggerManualCollection } = usePower();

  const meta = TAB_METADATA[currentTab] || TAB_METADATA.overview;

  // Dedicated Full-Screen Splash Screen on site start
  if (currentTab === 'splash') {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-[#070B19]">
        <SplashScreen
          onEnterDashboard={() => setCurrentTab('overview')}
          isConnected={true}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#EBF2F7] via-[#F4F7FB] to-[#EDF2F8] dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors">
      {/* FinEdge Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isConnected={true}
        modelReady={true}
        onOpenConnectionModal={() => setConnectionModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* FinEdge Top Navbar */}
        <Navbar
          title={meta.title}
          subtitle={meta.subtitle}
          onRefreshDemo={triggerManualCollection}
          isLoading={false}
          isConnected={true}
          onOpenSettings={() => setConnectionModalOpen(true)}
          alertCount={anomalyDetected ? 1 : 0}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto px-8 py-4">
          {currentTab === 'overview' && (
            <Overview onNavigateTab={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'live-monitoring' && <LiveMonitoring />}

          {currentTab === 'forecasting' && <AIForecasting />}

          {currentTab === 'anomaly' && <AnomalyDetection />}

          {currentTab === 'load-optimization' && <LoadOptimization />}

          {currentTab === 'reports' && <ReportsAnalytics />}

          {currentTab === 'devices' && <DevicesSensors />}
        </main>
      </div>

      {/* Settings Modal */}
      <ConnectionModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        onConnected={() => {
          triggerManualCollection();
          setConnectionModalOpen(false);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PowerProvider>
      <DashboardContent />
    </PowerProvider>
  );
};

export default App;
