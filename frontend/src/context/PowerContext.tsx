import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PhaseValues } from '../types/api';

export interface ElectricalEvent {
  id: string;
  title: string;
  date: string;
  value: string;
  type: 'positive' | 'negative' | 'neutral';
  category: 'feeder' | 'balance' | 'warning' | 'surge' | 'shift';
}

export interface DaySeries {
  date: string;
  day: string;
  load: number;
  phaseR: number;
  phaseY: number;
  phaseB: number;
  imbalance: number;
  inflow: number;
  outflow: number;
}

export interface PresetDateOption {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  days: string[];
}

export const PRESET_DATE_RANGES: PresetDateOption[] = [
  {
    id: 'may12-18',
    label: 'May 12 – May 18, 2024',
    startDate: '2024-05-12',
    endDate: '2024-05-18',
    days: ['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'],
  },
  {
    id: 'may19-25',
    label: 'May 19 – May 25, 2024',
    startDate: '2024-05-19',
    endDate: '2024-05-25',
    days: ['May 19', 'May 20', 'May 21', 'May 22', 'May 23', 'May 24', 'May 25'],
  },
  {
    id: 'may05-11',
    label: 'May 05 – May 11, 2024',
    startDate: '2024-05-05',
    endDate: '2024-05-11',
    days: ['May 05', 'May 06', 'May 07', 'May 08', 'May 09', 'May 10', 'May 11'],
  },
  {
    id: 'apr28-may04',
    label: 'Apr 28 – May 04, 2024',
    startDate: '2024-04-28',
    endDate: '2024-05-04',
    days: ['Apr 28', 'Apr 29', 'Apr 30', 'May 01', 'May 02', 'May 03', 'May 04'],
  },
  {
    id: 'today',
    label: 'Today (May 18, 2024 • Real-Time)',
    startDate: '2024-05-18',
    endDate: '2024-05-18',
    days: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
  },
];

interface PowerContextType {
  // Current Telemetry
  phaseR: number;
  phaseY: number;
  phaseB: number;
  phaseR_Volt: number;
  phaseY_Volt: number;
  phaseB_Volt: number;
  frequency: number;
  powerFactor: number;
  totalActivePower: number;
  statorTemp: number;
  bearingTemp: number;
  thdCurrent: number;
  neutralCurrent: number;
  imbalance: number;
  predictedImbalance: number;
  forecast: PhaseValues;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  anomalyDetected: boolean;
  recommendation: string;

  // Generic Dates & Series
  dateRangeText: string;
  lastUpdatedDate: string;
  weeklyTrend: DaySeries[];
  recentEvents: ElectricalEvent[];
  changeDateRange: (range: PresetDateOption | { label: string; days: string[] }) => void;
  activeDateOptionId: string;

  // 2-Minute Timer
  secondsRemaining: number;
  isAutoUpdating: boolean;
  setIsAutoUpdating: (val: boolean) => void;
  triggerManualCollection: () => void;
  lastSyncMessage: string | null;

  // Input Modifiers (Sliders & Presets)
  updatePhaseCurrents: (r: number, y: number, b: number) => void;
  applyPreset: (preset: 'balanced' | 'moderate' | 'severe' | 'phase_loss') => void;
  activePreset: string;
  activeScenarioName: string;

  // UI Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const PowerContext = createContext<PowerContextType | undefined>(undefined);

const generateSeriesForDays = (days: string[]): DaySeries[] => {
  const baseLoads = [18.2, 19.5, 17.8, 21.4, 18.3, 22.8, 24.6];
  const inflows = [3.2, 4.1, 2.8, 5.2, 3.8, 4.9, 5.8];
  const outflows = [-1.2, -1.8, -3.5, -2.1, -1.4, -2.8, -1.9];

  return days.map((day, idx) => {
    const i = idx % baseLoads.length;
    return {
      date: `${day}, 2024`,
      day,
      load: baseLoads[i],
      phaseR: 2.01 + (idx * 0.03),
      phaseY: 2.02 - (idx * 0.01),
      phaseB: 2.04 + (idx * 0.02),
      imbalance: Number((0.7 + (idx * 0.15)).toFixed(1)),
      inflow: inflows[i],
      outflow: outflows[i],
    };
  });
};

const generateEventsForRange = (rangeLabel: string): ElectricalEvent[] => {
  const mainDate = rangeLabel.includes('–') ? rangeLabel.split('–')[1].trim() : rangeLabel;
  return [
    {
      id: 'EVT-101',
      title: 'Feeder 1 Overload Monitored',
      date: mainDate,
      value: '- 12.99 A',
      type: 'negative',
      category: 'warning',
    },
    {
      id: 'EVT-102',
      title: 'Symmetrical Balance Reached',
      date: mainDate,
      value: '+ 3,850.00 kW',
      type: 'positive',
      category: 'balance',
    },
    {
      id: 'EVT-103',
      title: 'Phase Y Voltage Sag Corrected',
      date: mainDate,
      value: '- 86.40 V',
      type: 'negative',
      category: 'warning',
    },
    {
      id: 'EVT-104',
      title: 'Compressor Inrush Transient',
      date: mainDate,
      value: '- 24.50 A',
      type: 'negative',
      category: 'surge',
    },
    {
      id: 'EVT-105',
      title: 'Feeder Load Auto-Redistributed',
      date: mainDate,
      value: '- 500.00 A',
      type: 'neutral',
      category: 'shift',
    },
  ];
};

export const PowerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('phaseguard_theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('phaseguard_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('phaseguard_theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Electrical Telemetry State
  const [phaseR, setPhaseR] = useState<number>(2.02);
  const [phaseY, setPhaseY] = useState<number>(2.03);
  const [phaseB, setPhaseB] = useState<number>(2.04);
  const [phaseR_Volt, setPhaseR_Volt] = useState<number>(415.2);
  const [phaseY_Volt, setPhaseY_Volt] = useState<number>(414.8);
  const [phaseB_Volt, setPhaseB_Volt] = useState<number>(415.0);
  const [frequency, setFrequency] = useState<number>(50.02);
  const [powerFactor, setPowerFactor] = useState<number>(0.89);
  const [totalActivePower, setTotalActivePower] = useState<number>(24.58);
  const [statorTemp, setStatorTemp] = useState<number>(43.5);
  const [bearingTemp, setBearingTemp] = useState<number>(46.1);
  const [thdCurrent, setThdCurrent] = useState<number>(3.2);
  const [neutralCurrent, setNeutralCurrent] = useState<number>(4.32);

  const [activePreset, setActivePreset] = useState<string>('balanced');
  const [activeScenarioName, setActiveScenarioName] = useState<string>('Nominal Balanced Operation');

  // Generic Dates State with interactive date switcher
  const [dateRangeText, setDateRangeText] = useState<string>(PRESET_DATE_RANGES[0].label);
  const [activeDateOptionId, setActiveDateOptionId] = useState<string>(PRESET_DATE_RANGES[0].id);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string>('May 18, 2024 • 14:30 UTC');
  const [weeklyTrend, setWeeklyTrend] = useState<DaySeries[]>(
    generateSeriesForDays(PRESET_DATE_RANGES[0].days)
  );
  const [recentEvents, setRecentEvents] = useState<ElectricalEvent[]>(
    generateEventsForRange(PRESET_DATE_RANGES[0].label)
  );

  // 2-Minute (120s) Auto-Update Cycle
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(true);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Date Range Change Handler
  const changeDateRange = (range: PresetDateOption | { label: string; days: string[] }) => {
    setDateRangeText(range.label);
    if ('id' in range) {
      setActiveDateOptionId(range.id);
    } else {
      setActiveDateOptionId('custom');
    }
    setWeeklyTrend(generateSeriesForDays(range.days));
    setRecentEvents(generateEventsForRange(range.label));

    setLastSyncMessage(`Date range switched to: ${range.label}`);
    setTimeout(() => setLastSyncMessage(null), 4000);
  };

  // Calculate Imbalance % = max(|I - avg|) / avg * 100
  const avgCurrent = (phaseR + phaseY + phaseB) / 3;
  const imbalance =
    avgCurrent > 0
      ? (Math.max(
          Math.abs(phaseR - avgCurrent),
          Math.abs(phaseY - avgCurrent),
          Math.abs(phaseB - avgCurrent)
        ) /
          avgCurrent) *
        100
      : 0;

  // 30-Minute AI Forecast Simulation
  const forecast: PhaseValues = {
    R: Number((phaseR + (phaseR > 2.2 ? -0.04 : 0.01)).toFixed(3)),
    Y: Number((phaseY + (phaseY < 1.9 ? 0.03 : -0.01)).toFixed(3)),
    B: Number((phaseB + (phaseB < 1.9 ? 0.02 : -0.01)).toFixed(3)),
  };
  const forecastAvg = (forecast.R + forecast.Y + forecast.B) / 3;
  const predictedImbalance =
    forecastAvg > 0
      ? (Math.max(
          Math.abs(forecast.R - forecastAvg),
          Math.abs(forecast.Y - forecastAvg),
          Math.abs(forecast.B - forecastAvg)
        ) /
          forecastAvg) *
        100
      : 0;

  // Anomaly & Risk Evaluation
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let anomalyDetected = false;
  let recommendation = 'Phase currents appear reasonably balanced. Continue nominal monitoring.';

  if (phaseR < 0.5 || phaseY < 0.5 || phaseB < 0.5) {
    riskLevel = 'HIGH';
    anomalyDetected = true;
    recommendation =
      'EMERGENCY: Single-phasing loss detected. Shifting is strictly locked out. Disconnect feeder and inspect supply fuses.';
  } else if (imbalance >= 10 || thdCurrent > 6.0) {
    riskLevel = 'HIGH';
    anomalyDetected = true;
    const names = ['R', 'Y', 'B'];
    const curArr = [phaseR, phaseY, phaseB];
    const high = names[curArr.indexOf(Math.max(...curArr))];
    const low = names[curArr.indexOf(Math.min(...curArr))];
    recommendation = `CRITICAL ASYMMETRY: Phase ${high} is overloaded while Phase ${low} is underutilized. Ask a qualified electrical engineer to redistribute loads from ${high} to ${low}.`;
  } else if (imbalance >= 5) {
    riskLevel = 'MEDIUM';
    recommendation =
      'MODERATE ASYMMETRY: Load shifting recommended. Transferring single-phase branch circuit will restore balance to < 2.0%.';
  }

  // Routine to execute sensor data update (called every 2 minutes or manually)
  const executeDataUpdate = useCallback(() => {
    const jitterR = (Math.random() - 0.5) * 0.06;
    const jitterY = (Math.random() - 0.5) * 0.06;
    const jitterB = (Math.random() - 0.5) * 0.06;
    const jitterVolt = (Math.random() - 0.5) * 1.2;

    setPhaseR((prev) => Math.max(0.2, Number((prev + jitterR).toFixed(2))));
    setPhaseY((prev) => Math.max(0.2, Number((prev + jitterY).toFixed(2))));
    setPhaseB((prev) => Math.max(0.2, Number((prev + jitterB).toFixed(2))));
    setPhaseR_Volt((prev) => Number((415.0 + jitterVolt).toFixed(1)));
    setPhaseY_Volt((prev) => Number((414.8 + jitterVolt * 0.9).toFixed(1)));
    setPhaseB_Volt((prev) => Number((415.2 - jitterVolt * 0.8).toFixed(1)));
    setFrequency((prev) => Number((50.0 + (Math.random() - 0.5) * 0.08).toFixed(2)));
    setTotalActivePower((prev) => Number((24.58 + (Math.random() - 0.5) * 0.5).toFixed(2)));
    setNeutralCurrent((prev) => Number((4.32 + (Math.random() - 0.5) * 0.2).toFixed(2)));

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setLastUpdatedDate(`May 18, 2024 • ${hours}:${mins} UTC`);

    setLastSyncMessage('2-Minute Sensor Cycle: New telemetry ingested from Crompton-Greaves Meter Hub.');
    setTimeout(() => setLastSyncMessage(null), 5000);
    setSecondsRemaining(120);
  }, []);

  // 2-Minute Timer Interval
  useEffect(() => {
    if (!isAutoUpdating) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          executeDataUpdate();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoUpdating, executeDataUpdate]);

  // Manual Trigger
  const triggerManualCollection = () => {
    executeDataUpdate();
  };

  // User Input Modification
  const updatePhaseCurrents = (r: number, y: number, b: number) => {
    setPhaseR(Number(r.toFixed(2)));
    setPhaseY(Number(y.toFixed(2)));
    setPhaseB(Number(b.toFixed(2)));
    setActivePreset('custom');
    setActiveScenarioName('Custom Operator Tuning');
  };

  // Presets Application
  const applyPreset = (preset: 'balanced' | 'moderate' | 'severe' | 'phase_loss') => {
    setActivePreset(preset);
    if (preset === 'balanced') {
      setPhaseR(2.02);
      setPhaseY(2.03);
      setPhaseB(2.04);
      setThdCurrent(3.2);
      setActiveScenarioName('Nominal Balanced (OK)');
    } else if (preset === 'moderate') {
      setPhaseR(2.28);
      setPhaseY(2.02);
      setPhaseB(1.88);
      setThdCurrent(4.1);
      setActiveScenarioName('Moderate Imbalance (Caution)');
    } else if (preset === 'severe') {
      setPhaseR(2.65);
      setPhaseY(1.98);
      setPhaseB(1.82);
      setThdCurrent(5.8);
      setActiveScenarioName('Severe Phase R Overload (CRITICAL)');
    } else if (preset === 'phase_loss') {
      setPhaseR(2.15);
      setPhaseY(0.25);
      setPhaseB(2.10);
      setThdCurrent(7.2);
      setActiveScenarioName('Single Phasing Loss (EMERGENCY)');
    }
  };

  return (
    <PowerContext.Provider
      value={{
        phaseR,
        phaseY,
        phaseB,
        phaseR_Volt,
        phaseY_Volt,
        phaseB_Volt,
        frequency,
        powerFactor,
        totalActivePower,
        statorTemp,
        bearingTemp,
        thdCurrent,
        neutralCurrent,
        imbalance,
        predictedImbalance,
        forecast,
        riskLevel,
        anomalyDetected,
        recommendation,
        dateRangeText,
        lastUpdatedDate,
        weeklyTrend,
        recentEvents,
        changeDateRange,
        activeDateOptionId,
        secondsRemaining,
        isAutoUpdating,
        setIsAutoUpdating,
        triggerManualCollection,
        lastSyncMessage,
        updatePhaseCurrents,
        applyPreset,
        activePreset,
        activeScenarioName,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </PowerContext.Provider>
  );
};

export const usePower = () => {
  const context = useContext(PowerContext);
  if (!context) {
    throw new Error('usePower must be used within a PowerProvider');
  }
  return context;
};
