import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { apiService, getBaseApiUrl, setBaseApiUrl } from '../services/api';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState(getBaseApiUrl());
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    setTesting(true);
    setStatusMessage(null);
    setStatusType(null);
    try {
      setBaseApiUrl(url);
      const health = await apiService.getHealth();
      if (health.status === 'healthy') {
        setStatusType('success');
        setStatusMessage(
          `Connected successfully! Models: Phase RF (${
            health.phase_model_loaded ? 'Ready' : 'Not Ready'
          }), Anomaly IF (${health.anomaly_model_loaded ? 'Ready' : 'Not Ready'})`
        );
        onConnected();
      } else {
        setStatusType('error');
        setStatusMessage(`Backend reported status: ${health.status}`);
      }
    } catch (err: any) {
      setStatusType('error');
      setStatusMessage(
        err.message || 'Failed to connect. Please verify backend is running on this port.'
      );
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefault = () => {
    const defaultUrl = 'http://localhost:8000';
    setUrl(defaultUrl);
    setBaseApiUrl(defaultUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend Connection Settings</h3>
              <p className="text-xs text-slate-400">Configure FastAPI endpoint URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              API Base URL (VITE_API_URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Default
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Local FastAPI: <code className="text-blue-400 font-mono">http://localhost:8000</code> • Google Colab proxy or ngrok URLs are also supported.
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusType === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span className="leading-relaxed">{statusMessage}</span>
            </div>
          )}

          {/* Available Endpoints Preview */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-bold">
              Integrated Endpoints
            </div>
            <div className="text-emerald-400 flex items-center justify-between">
              <span>GET /health</span>
              <span className="text-[10px] text-slate-400 font-sans">Heartbeat check</span>
            </div>
            <div className="text-blue-400 flex items-center justify-between">
              <span>GET /model-info</span>
              <span className="text-[10px] text-slate-400 font-sans">Model specs & MAE</span>
            </div>
            <div className="text-cyan-400 flex items-center justify-between">
              <span>GET /demo</span>
              <span className="text-[10px] text-slate-400 font-sans">Sample inference</span>
            </div>
            <div className="text-amber-400 flex items-center justify-between">
              <span>POST /predict</span>
              <span className="text-[10px] text-slate-400 font-sans">Client telemetry batch</span>
            </div>
            <div className="text-purple-400 flex items-center justify-between">
              <span>POST /powerzoo-forecast</span>
              <span className="text-[10px] text-slate-400 font-sans">AEMO Grid forecast</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
          <a
            href={`${url}/docs`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>Open Swagger API Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Test & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

