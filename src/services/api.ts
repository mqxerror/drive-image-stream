import type { Project, ProjectImage, Template, Stats, UsageStats, Settings } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://automator.pixelcraftedmedia.com/webhook';

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
  // Projects
  getProjects: () => fetchApi<{ projects: Project[] }>('/api/projects'),
  
  getProject: (id: number) => fetchApi<Project>(`/api/projects/${id}`),
  
  createProject: (data: Partial<Project>) => 
    fetchApi<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateProject: (id: number, data: Partial<Project>) => 
    fetchApi<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),
  
  scanProjectFolder: (id: number) => 
    fetchApi<{ totalImages: number }>(`/api/projects/${id}/scan`, {
      method: 'POST',
    }),
  
  startTrial: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/projects/${id}/start-trial`, {
      method: 'POST',
    }),
  
  startBatch: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/projects/${id}/start-batch`, {
      method: 'POST',
    }),
  
  pauseProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/projects/${id}/pause`, {
      method: 'POST',
    }),
  
  resumeProject: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/projects/${id}/resume`, {
      method: 'POST',
    }),

  // Project Images
  getProjectImages: (projectId: number) => 
    fetchApi<{ images: ProjectImage[] }>(`/api/projects/${projectId}/images`),
  
  updateImage: (id: number, data: Partial<ProjectImage>) => 
    fetchApi<ProjectImage>(`/api/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  redoImage: (imageId: number, templateId?: number, customPrompt?: string) => 
    fetchApi<{ success: boolean }>('/api/images/redo', {
      method: 'POST',
      body: JSON.stringify({ imageId, templateId, customPrompt }),
    }),
  
  redoBulk: (imageIds: number[], templateId?: number, customPrompt?: string, saveAsTemplate?: { name: string }) => 
    fetchApi<{ success: boolean }>('/api/images/redo-bulk', {
      method: 'POST',
      body: JSON.stringify({ imageIds, templateId, customPrompt, saveAsTemplate }),
    }),

  // Templates
  getTemplates: () => fetchApi<{ templates: Template[] }>('/api/templates'),
  
  createTemplate: (data: Partial<Template>) => 
    fetchApi<Template>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTemplate: (id: number, data: Partial<Template>) => 
    fetchApi<Template>(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteTemplate: (id: number) => 
    fetchApi<{ success: boolean }>(`/api/templates/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: () => fetchApi<Stats>('/api/stats'),
  
  getUsageStats: () => fetchApi<UsageStats>('/api/stats/usage'),

  // Settings
  getSettings: () => fetchApi<Settings>('/api/settings'),
  
  updateSettings: (settings: Partial<Settings>) => 
    fetchApi<{ success: boolean }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
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
