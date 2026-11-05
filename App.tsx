import React, { useState, useEffect, useCallback } from 'react';
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
import { apiService } from './services/api';
import { PredictResponse, ModelInfo, Reading } from './types/api';
import { AlertCircle, RefreshCw, Server } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('overview');
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('phaseguard_theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('phaseguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('phaseguard_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Initial Data Fetch
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Check health
      const health = await apiService.getHealth();
      setIsConnected(health.status === 'healthy');

      // 2. Fetch Model Info
      try {
        const info = await apiService.getModelInfo();
        setModelInfo(info);
      } catch (err) {
        console.warn('Failed to load model info', err);
      }

      // 3. Fetch Demo Prediction (/demo)
      try {
        const demoPred = await apiService.getDemoPrediction();
        setPrediction(demoPred);
      } catch (err) {
        console.warn('Failed to load demo prediction', err);
      }

      // 4. Fetch Historical Readings (/history)
      try {
        const histRes = await apiService.getHistory(80);
        if (histRes.readings && histRes.readings.length > 0) {
          setHistory(histRes.readings);
        }
      } catch (err) {
        console.warn('Failed to load history', err);
      }
    } catch (err: any) {
      setIsConnected(false);
      setErrorMessage(
        `Unable to reach backend at ${apiService.getApiUrl()}. Run "py backend/main.py" to start the FastAPI server.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle custom prediction callback from DevicesSensors
  const handleCustomPrediction = (result: PredictResponse) => {
    setPrediction(result);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isConnected={isConnected}
        modelReady={modelInfo !== null}
        onOpenConnectionModal={() => setConnectionModalOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar
          onRefreshDemo={fetchData}
          isLoading={isLoading}
          isConnected={isConnected}
          onOpenSettings={() => setConnectionModalOpen(true)}
          alertCount={prediction?.anomaly_detected ? 1 : 0}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Offline Banner if backend disconnected */}
        {!isConnected && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Backend disconnected ({apiService.getApiUrl()}). Start the server with{' '}
                <code className="bg-rose-950/60 px-1.5 py-0.5 rounded text-rose-200 font-mono">
                  py backend/main.py
                </code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConnectionModalOpen(true)}
                className="underline hover:text-white font-semibold"
              >
                Configure URL
              </button>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {currentTab === 'splash' && (
            <SplashScreen
              onEnterDashboard={() => setCurrentTab('overview')}
              isConnected={isConnected}
            />
          )}

          {currentTab === 'overview' && (
            <Overview
              prediction={prediction}
              modelInfo={modelInfo}
              history={history}
              isLoading={isLoading}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'live-monitoring' && (
            <LiveMonitoring
              history={history}
              currentPrediction={prediction}
              onRefreshTelemetry={fetchData}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'forecasting' && (
            <AIForecasting
              prediction={prediction}
              modelInfo={modelInfo}
              onRefreshDemo={fetchData}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'anomaly' && (
            <AnomalyDetection prediction={prediction} history={history} />
          )}

          {currentTab === 'load-optimization' && (
            <LoadOptimization prediction={prediction} />
          )}

          {currentTab === 'reports' && (
            <ReportsAnalytics
              history={history}
              prediction={prediction}
              modelInfo={modelInfo}
            />
          )}

          {currentTab === 'devices' && (
            <DevicesSensors
              history={history}
              onCustomPredictionSuccess={handleCustomPrediction}
              modelInfo={modelInfo}
            />
          )}
        </main>
      </div>

      {/* Connection & API Configuration Modal */}
      <ConnectionModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
        onConnected={() => {
          fetchData();
          setConnectionModalOpen(false);
        }}
      />
    </div>
  );
};
export default App;

