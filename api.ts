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

// Transform backend settings response to frontend Settings type
function transformSettings(data: any): Settings {
  const settings = data.settings || data;
  return {
    defaultResolution: (settings.resolution || '2K') as '2K' | '4K',
    defaultTrialCount: parseInt(settings.trial_count || settings.defaultTrialCount || '5'),
    defaultTemplateId: settings.default_template_id || settings.defaultTemplateId || null,
    cost2K: parseFloat(settings.cost_per_image_2k || settings.cost2K || '0.12'),
    cost4K: parseFloat(settings.cost_per_image_4k || settings.cost4K || '0.24'),
  };
}

// Transform backend template to frontend Template type
function transformTemplate(data: any): Template {
  return {
    id: data.Id || data.id,
    name: data.Title || data.name,
    category: data.category || 'General',
    subcategory: data.subcategory || '',
    basePrompt: data.base_prompt || data.basePrompt || '',
    style: data.style || 'Modern',
    background: data.background || 'White',
    lighting: data.lighting || '',
    isSystem: data.is_system || data.isSystem || false,
    isActive: data.is_active !== false && data.isActive !== false,
    createdBy: data.created_by || data.createdBy || 'user',
    usageCount: data.usage_count || data.usageCount || 0,
  };
}

// Transform backend project to frontend Project type
function transformProject(data: any): Project {
  return {
    id: data.Id || data.id,
    name: data.Title || data.name,
    inputFolderUrl: data.input_folder_url || data.inputFolderUrl || '',
    inputFolderId: data.input_folder_id || data.inputFolderId || '',
    outputFolderUrl: data.output_folder_url || data.outputFolderUrl || '',
    outputFolderId: data.output_folder_id || data.outputFolderId || '',
    templateId: data.template_id || data.templateId || null,
    customPrompt: data.custom_prompt || data.customPrompt || null,
    status: data.status || 'draft',
    resolution: data.resolution || '2K',
    trialCount: data.trial_count || data.trialCount || 5,
    trialCompleted: data.trial_completed || data.trialCompleted || 0,
    totalImages: data.total_images || data.totalImages || 0,
    processedImages: data.processed_images || data.processedImages || 0,
    failedImages: data.failed_images || data.failedImages || 0,
    totalCost: parseFloat(data.total_cost || data.totalCost || '0'),
    createdAt: data.CreatedAt || data.createdAt || new Date().toISOString(),
    updatedAt: data.UpdatedAt || data.updatedAt || new Date().toISOString(),
  };
}

export const api = {
  // Projects
  getProjects: async () => {
    const data = await fetchApi<{ projects: any[] }>('/image-optimizer/projects');
    return { projects: (data.projects || []).map(transformProject) };
  },
  
  getProject: async (id: number) => {
    const data = await fetchApi<any>(`/image-optimizer/projects/${id}`);
    return transformProject(data.project || data);
  },
  
  createProject: async (data: Partial<Project>) => {
    const result = await fetchApi<any>('/image-optimizer/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformProject(result.project || result);
  },
  
  updateProject: async (id: number, data: Partial<Project>) => {
    const result = await fetchApi<any>(`/image-optimizer/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return transformProject(result.project || result);
  },
  
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
      body: JSON.stringify(data),
    }),
  
  redoImage: (imageId: number, templateId?: number, customPrompt?: string) => 
    fetchApi<{ success: boolean }>('/image-optimizer/redo', {
      method: 'POST',
      body: JSON.stringify({ imageId, templateId, customPrompt }),
    }),
  
  redoBulk: (imageIds: number[], templateId?: number, customPrompt?: string, saveAsTemplate?: { name: string }) => 
    fetchApi<{ success: boolean }>('/image-optimizer/redo-bulk', {
      method: 'POST',
      body: JSON.stringify({ imageIds, templateId, customPrompt, saveAsTemplate }),
    }),

  // Templates
  getTemplates: async () => {
    const data = await fetchApi<{ templates: any[] }>('/image-optimizer/templates');
    return { templates: (data.templates || []).map(transformTemplate) };
  },
  
  createTemplate: async (data: Partial<Template>) => {
    const result = await fetchApi<any>('/image-optimizer/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformTemplate(result.template || result);
  },
  
  updateTemplate: async (id: number, data: Partial<Template>) => {
    const result = await fetchApi<any>(`/image-optimizer/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return transformTemplate(result.template || result);
  },
  
  deleteTemplate: (id: number) => 
    fetchApi<{ success: boolean }>(`/image-optimizer/templates/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: async (): Promise<Stats> => {
    const data = await fetchApi<any>('/image-optimizer/stats');
    return {
      projectCount: data.projectCount || 0,
      processedThisMonth: data.processedToday || data.processedThisMonth || 0,
      totalCostThisMonth: data.totalCost || data.totalCostThisMonth || 0,
      avgTimeSeconds: data.avgTimeSeconds || data.avgTime || 0,
    };
  },
  
  getUsageStats: async (): Promise<UsageStats> => {
    const data = await fetchApi<any>('/image-optimizer/stats');
    return {
      imagesProcessed: data.processedToday || data.imagesProcessed || 0,
      totalCost: data.totalCost || 0,
      avgTime: data.avgTimeSeconds || data.avgTime || 0,
    };
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const data = await fetchApi<any>('/image-optimizer/settings');
    return transformSettings(data);
  },
  
  updateSettings: (settings: Partial<Settings>) => 
    fetchApi<{ success: boolean }>('/image-optimizer/settings', {
      method: 'PUT',
      body: JSON.stringify({
        settings: {
          resolution: settings.defaultResolution,
          trial_count: settings.defaultTrialCount?.toString(),
          default_template_id: settings.defaultTemplateId?.toString(),
        }
      }),
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
