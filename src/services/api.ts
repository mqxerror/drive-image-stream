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
  fileId: string;
  fileName: string;
  status: 'success' | 'failed';
  resolution?: string;
  cost?: number;
  timeSeconds?: number;
  completedAt: string;
  optimizedUrl?: string;
  optimizedDriveId?: string;
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

export interface Settings {
  inputFolderId: string;
  outputFolderId: string;
  cost2K: number;
  cost4K: number;
  defaultResolution: '2K' | '4K';
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
  
  redoImage: (fileId: string, fileName: string) => 
    fetchApi<{ success: boolean; message?: string }>('/image-optimizer/redo', {
      method: 'POST',
      body: JSON.stringify({ fileId, fileName }),
    }),
  
  getSettings: () => fetchApi<Settings>('/image-optimizer/settings'),
  
  updateSettings: (settings: Settings) => 
    fetchApi<{ success: boolean; message?: string }>('/image-optimizer/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
