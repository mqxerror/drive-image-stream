const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://automator.pixelcraftedmedia.com/webhook';

export interface Stats {
  inQueue: number;
  currentlyProcessing: number;
  processedToday: number;
  percentChangeFromYesterday: number;
  totalCost: number;
  avgTimeSeconds: number;
}

export interface QueueItem {
  id: string;
  fileId: string;
  fileName: string;
  status: 'queued' | 'processing' | 'optimizing' | 'success' | 'failed';
  progress: number;
  startedAt?: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  status: 'success' | 'failed';
  resolution?: string;
  cost?: number;
  timeSeconds?: number;
  completedAt: string;
  optimizedUrl?: string;
}

export interface QueueResponse {
  queue: QueueItem[];
  total: number;
}

export interface HistoryResponse {
  history: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getStats: () => fetchApi<Stats>('/image-optimizer/stats'),
  
  getQueue: () => fetchApi<QueueResponse>('/image-optimizer/queue'),
  
  getHistory: () => fetchApi<HistoryResponse>('/image-optimizer/history'),
  
  triggerOptimizer: () => fetchApi<{ success: boolean; message?: string }>('/image-optimizer/trigger', {
    method: 'POST',
  }),
};
