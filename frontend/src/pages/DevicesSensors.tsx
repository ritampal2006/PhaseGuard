import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Server,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Send,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { usePower } from '../context/PowerContext';

export const DevicesSensors: React.FC = () => {
  const {
    phaseR,
    phaseY,
    phaseB,
    secondsRemaining,
    triggerManualCollection,
    dateRangeText,
    lastUpdatedDate,
  } = usePower();

  const [selectedDevice, setSelectedDevice] = useState<string>('DEV-PRAXIS-01');

  // Connected Devices inventory
  const devices = [
    {
      id: 'DEV-PRAXIS-01',
      name: 'Praxis Crompton Greaves Pump Node',
      type: 'Three-Phase Motor Telemetry Logger',
      ip: '192.168.1.104',
      status: 'ONLINE',
      sampling: '1 sample / 2 min',
      latency: '18ms',
      channels: '3x Current (CT), 3x Voltage (PT), Stator RTD',
      firmware: 'v3.4.12-industrial',
    },
    {
      id: 'MTR-FEEDER-03',
      name: 'Schneider PowerLogic PM8000',
      type: 'Class 0.2S Revenue Quality Meter',
      ip: '192.168.1.112',
      status: 'ONLINE',
      sampling: '100ms True RMS',
      latency: '12ms',
      channels: 'True RMS, THD, Individual Harmonics to 63rd',
      firmware: 'v2.1.0-sec',
    },
    {
      id: 'SENS-VIB-07',
      name: 'IFM Efector Vibration & Thermal Bus',
      type: 'Piezoelectric Accelerometer & PT100',
      ip: '192.168.1.145',
      status: 'ONLINE',
      sampling: 'Continuous Modbus RTU',
      latency: '28ms',
      channels: 'Drive-End Vibration, Stator Temp, Bearing RTD',
      firmware: 'v1.8.4',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Devices & Connected Smart Sensors
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF]">
              3/3 NODES HEALTHY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Industrial edge gateway, current transformers (CT), and potential transformers (PT) connected to PhaseGuard
          </p>
        </div>

        <button
          onClick={triggerManualCollection}
          className="px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20 hover:bg-[#0F766E] transition"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Ping All Nodes</span>
        </button>
      </div>

      {/* Connected Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {devices.map((dev) => (
          <div
            key={dev.id}
            onClick={() => setSelectedDevice(dev.id)}
            className={`p-6 rounded-3xl bg-white dark:bg-[#0F172A] border transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${
              selectedDevice === dev.id
                ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20'
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] dark:bg-[#0D9488]/20 text-[#0D9488] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {dev.status}
              </span>
            </div>

            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {dev.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">{dev.type}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">IP Address:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{dev.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sampling Rate:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{dev.sampling}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roundtrip Latency:</span>
                <span className="font-mono text-emerald-600 font-bold">{dev.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Ingestion Details for Selected Device */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          Node Channel Telemetry Stream (Active Node: {selectedDevice})
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Current CT coil readings mapped directly to PhaseGuard neural inference engine
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-red-500 uppercase">CT-1 (Phase R)</span>
            <p className="text-xl font-mono font-black text-slate-800 dark:text-white mt-1">
              {phaseR.toFixed(2)} A
            </p>
            <p className="text-[10px] text-slate-400 mt-1">ADC: 4096 / 16-bit Sigma-Delta</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-amber-500 uppercase">CT-2 (Phase Y)</span>
            <p className="text-xl font-mono font-black text-slate-800 dark:text-white mt-1">
              {phaseY.toFixed(2)} A
            </p>
            <p className="text-[10px] text-slate-400 mt-1">ADC: 4096 / 16-bit Sigma-Delta</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-blue-500 uppercase">CT-3 (Phase B)</span>
            <p className="text-xl font-mono font-black text-slate-800 dark:text-white mt-1">
              {phaseB.toFixed(2)} A
            </p>
            <p className="text-[10px] text-slate-400 mt-1">ADC: 4096 / 16-bit Sigma-Delta</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DevicesSensors;
