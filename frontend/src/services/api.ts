import {
  HealthResponse,
  ModelInfo,
  PredictResponse,
  Reading,
  PowerZooForecastResponse,
  HistoryResponse,
} from '../types/api';

// Retrieve backend URL from localStorage if overridden, otherwise relative origin or Vite env
export const getBaseApiUrl = (): string => {
  const customUrl = localStorage.getItem('phaseguard_api_url');
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  // When running in a browser, use origin so Vite proxy seamlessly routes all backend calls
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
};

export const setBaseApiUrl = (url: string) => {
  if (url && url.trim().length > 0) {
    localStorage.setItem('phaseguard_api_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('phaseguard_api_url');
  }
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }
  return res.json();
};

export const apiService = {
  getApiUrl: getBaseApiUrl,
  setApiUrl: setBaseApiUrl,

  async getHealth(): Promise<HealthResponse> {
    const url = `${getBaseApiUrl()}/health`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return handleResponse<HealthResponse>(res);
  },

  async getModelInfo(): Promise<ModelInfo> {
    const url = `${getBaseApiUrl()}/model-info`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return handleResponse<ModelInfo>(res);
  },

  async getDemoPrediction(): Promise<PredictResponse> {
    const url = `${getBaseApiUrl()}/demo`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return handleResponse<PredictResponse>(res);
  },

  async postPredict(history: Reading[]): Promise<PredictResponse> {
    const url = `${getBaseApiUrl()}/predict`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ history }),
    });
    return handleResponse<PredictResponse>(res);
  },

  async getPowerZooInfo(): Promise<any> {
    const url = `${getBaseApiUrl()}/powerzoo-info`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return handleResponse<any>(res);
  },

  async postPowerZooForecast(history: number[]): Promise<PowerZooForecastResponse> {
    const url = `${getBaseApiUrl()}/powerzoo-forecast`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ history }),
    });
    return handleResponse<PowerZooForecastResponse>(res);
  },

  async getHistory(limit: number = 80): Promise<HistoryResponse> {
    const url = `${getBaseApiUrl()}/history?limit=${limit}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return handleResponse<HistoryResponse>(res);
  },
};
