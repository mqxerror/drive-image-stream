import type { Project, ProjectImage, Template, Stats, UsageStats, Settings } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://automator.pixelcraftedmedia.com/webhook';

// Snake case to camelCase converter
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Transform object keys from snake_case to camelCase
function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = toCamelCase(key);
      transformed[camelKey] = transformKeys(value);
    }
    return transformed as T;
  }
  
  return obj as T;
}

// CamelCase to snake_case converter for request bodies
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Transform object keys from camelCase to snake_case
function transformKeysToSnake<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToSnake(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const snakeKey = toSnakeCase(key);
      transformed[snakeKey] = transformKeysToSnake(value);
    }
    return transformed as T;
  }
  
  return obj as T;
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

  const data = await response.json();
  return transformKeys<T>(data);
}

export const api = {
  // Projects
  getProjects: () => fetchApi<{ projects: Project[] }>('/image-optimizer/projects'),
  
  getProject: (id: number) => fetchApi<Project>(`/image-optimizer/projects/${id}`),
  
  createProject: (data: Partial<Project>) => 
    fetchApi<Project>('/image-optimizer/projects', {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake(data)),
    }),
  
  updateProject: (id: number, data: Partial<Project>) => 
    fetchApi<Project>(`/image-optimizer/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(data)),
    }),
  
  deleteProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/projects/${id}`, {
      method: 'DELETE',
    }),
  
  scanProjectFolder: (id: number) => 
    fetchApi<{ totalImages: number }>(`/image-optimizer/projects/${id}/scan`, {
      method: 'POST',
    }),
  
  startTrial: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/projects/${id}/start-trial`, {
      method: 'POST',
    }),
  
  startBatch: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/projects/${id}/start-batch`, {
      method: 'POST',
    }),
  
  pauseProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/projects/${id}/pause`, {
      method: 'POST',
    }),
  
  resumeProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/projects/${id}/resume`, {
      method: 'POST',
    }),

  // Project Images
  getProjectImages: (projectId: number) => 
    fetchApi<{ images: ProjectImage[] }>(`/image-optimizer/projects/${projectId}/images`),
  
  updateImage: (id: number, data: Partial<ProjectImage>) => 
    fetchApi<ProjectImage>(`/image-optimizer/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(data)),
    }),
  
  redoImage: (imageId: number, templateId?: number, customPrompt?: string) => 
    fetchApi<{ success: boolean }>('/image-optimizer/images/redo', {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake({ imageId, templateId, customPrompt })),
    }),
  
  redoBulk: (imageIds: number[], templateId?: number, customPrompt?: string, saveAsTemplate?: { name: string }) => 
    fetchApi<{ success: boolean }>('/image-optimizer/images/redo-bulk', {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake({ imageIds, templateId, customPrompt, saveAsTemplate })),
    }),

  // Templates
  getTemplates: () => fetchApi<{ templates: Template[] }>('/image-optimizer/templates'),
  
  createTemplate: (data: Partial<Template>) => 
    fetchApi<Template>('/image-optimizer/templates', {
      method: 'POST',
      body: JSON.stringify(transformKeysToSnake(data)),
    }),
  
  updateTemplate: (id: number, data: Partial<Template>) => 
    fetchApi<Template>(`/image-optimizer/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(data)),
    }),
  
  deleteTemplate: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/templates/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: () => fetchApi<Stats>('/image-optimizer/stats'),
  
  getUsageStats: () => fetchApi<UsageStats>('/image-optimizer/stats/usage'),

  // Settings
  getSettings: () => fetchApi<Settings>('/image-optimizer/settings'),
  
  updateSettings: (settings: Partial<Settings>) => 
    fetchApi<{ success: boolean }>('/image-optimizer/settings', {
      method: 'PUT',
      body: JSON.stringify(transformKeysToSnake(settings)),
    }),
};

// Helper to parse folder ID from Google Drive URL
export function parseFolderId(url: string): string | null {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Helper to get thumbnail URL
export function getThumbnailUrl(driveId: string, size: number = 100): string {
  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
}
