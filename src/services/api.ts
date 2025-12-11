// Image Optimizer Pro - API Service
// Connects to n8n webhooks at automator.pixelcraftedmedia.com

import { getEndpoint } from '@/hooks/useApiConfig';

// Types
export interface Settings {
  inputFolderId: string;
  outputFolderId: string;
  batchSize: number;
  scheduleMinutes: number;
  resolution: string;
  costPerImage2k: number;
  costPerImage4k: number;
  customPrompt: string;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  basePrompt: string;
  style: string;
  background: string;
  lighting: string;
  isSystem: boolean;
  isActive: boolean;
  createdBy: string;
  usageCount: number;
}

export interface Project {
  id: number;
  name: string;
  inputFolderUrl: string;
  inputFolderId: string | null;
  outputFolderUrl: string;
  outputFolderId: string | null;
  templateId: number | null;
  templateName?: string;
  customPrompt: string;
  status: string;
  resolution: string;
  trialCount: number;
  trialCompleted: number;
  totalImages: number;
  processedImages: number;
  failedImages: number;
  totalCost: number;
}

export interface Stats {
  totalProcessed: number;
  totalPending: number;
  totalFailed: number;
  successRate: number;
  averageProcessingTime: number;
  totalCost: number;
  // New fields for dashboard
  processingNow: number;
  completedToday: number;
  costToday: number;
}

export interface QueueItem {
  id: number;
  fileId: string;
  fileName: string;
  status: string;
  progress: number;
  startedAt: string;
  lastUpdated: string;
  taskId: string | null;
  errorMessage: string | null;
  retryCount: number;
}

export interface HistoryItem {
  id: number;
  fileId: string;
  fileName: string;
  status: string;
  resolution: string;
  cost: number;
  timeSeconds: number;
  completedAt: string;
  startedAt: string;
  optimizedUrl: string | null;
  optimizedDriveId: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
  generatedPrompt?: string | null;
}

// Transform functions for snake_case to camelCase conversion
function transformSettings(data: any): Settings {
  const settings = data.settings || data;
  return {
    inputFolderId: settings.input_folder_id || settings.inputFolderId || "",
    outputFolderId: settings.output_folder_id || settings.outputFolderId || "",
    batchSize: parseInt(settings.batch_size || settings.batch_siz || settings.batchSize || "1", 10),
    scheduleMinutes: parseInt(settings.schedule_minutes || settings.scheduleMinutes || "2", 10),
    resolution: settings.resolution || "2K",
    costPerImage2k: parseFloat(settings.cost_per_image_2k || settings.costPerImage2k || "0.12"),
    costPerImage4k: parseFloat(settings.cost_per_image_4k || settings.costPerImage4k || "0.24"),
    customPrompt: settings.custom_prompt || settings.customPrompt || "",
  };
}

function transformTemplate(data: any): Template {
  return {
    id: data.id || data.Id,
    name: data.name || data.Title || "",
    category: data.category || "General",
    subcategory: data.subcategory || "",
    basePrompt: data.basePrompt || data.base_prompt || "",
    style: data.style || "Modern",
    background: data.background || "White",
    lighting: data.lighting || "",
    isSystem: data.isSystem || data.is_system || false,
    isActive: data.isActive !== undefined ? data.isActive : data.is_active !== false,
    createdBy: data.createdBy || data.created_by || "user",
    usageCount: data.usageCount || data.usage_count || 0,
  };
}

function transformProject(data: any): Project {
  return {
    id: data.id || data.Id,
    name: data.name || data.Title || "",
    inputFolderUrl: data.inputFolderUrl || data.input_folder_url || "",
    inputFolderId: data.inputFolderId || data.input_folder_id || null,
    outputFolderUrl: data.outputFolderUrl || data.output_folder_url || "",
    outputFolderId: data.outputFolderId || data.output_folder_id || null,
    templateId: data.templateId || data.template_id || null,
    templateName: data.templateName || data.template_name || undefined,
    customPrompt: data.customPrompt || data.custom_prompt || "",
    status: data.status || "draft",
    resolution: data.resolution || "2K",
    trialCount: data.trialCount || data.trial_count || 5,
    trialCompleted: data.trialCompleted || data.trial_completed || 0,
    totalImages: data.totalImages || data.total_images || 0,
    processedImages: data.processedImages || data.processed_images || 0,
    failedImages: data.failedImages || data.failed_images || 0,
    totalCost: data.totalCost || data.total_cost || 0,
  };
}

// API Functions

// Settings
export async function getSettings(): Promise<Settings> {
  const response = await fetch(getEndpoint('settings'));
  if (!response.ok) throw new Error("Failed to fetch settings");
  const data = await response.json();
  return transformSettings(data);
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const response = await fetch(getEndpoint('settings'), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
  if (!response.ok) throw new Error("Failed to update settings");
}

// Stats - API returns: inQueue, currentlyProcessing, processedToday, totalCost, avgTimeSeconds
export async function getStats(): Promise<Stats> {
  const response = await fetch(getEndpoint('stats'));
  if (!response.ok) throw new Error("Failed to fetch stats");
  const data = await response.json();
  return {
    totalProcessed: data.processedToday ?? data.totalProcessed ?? 0,
    totalPending: data.inQueue ?? data.totalPending ?? 0,
    totalFailed: data.totalFailed ?? 0,
    successRate: data.successRate ?? 100,
    averageProcessingTime: data.avgTimeSeconds ?? data.averageProcessingTime ?? 0,
    totalCost: data.totalCost ?? 0,
    // Dashboard specific - use currentlyProcessing from API
    processingNow: data.currentlyProcessing ?? data.processingNow ?? 0,
    completedToday: data.processedToday ?? data.completedToday ?? 0,
    costToday: data.totalCost ?? data.costToday ?? 0,
  };
}

// Templates
export async function getTemplates(): Promise<Template[]> {
  const response = await fetch(getEndpoint('templates'));
  if (!response.ok) throw new Error("Failed to fetch templates");
  const data = await response.json();
  const templates = data.templates || data || [];
  return templates.map(transformTemplate);
}

export async function createTemplate(template: Omit<Template, "id" | "usageCount">): Promise<Template> {
  const response = await fetch(getEndpoint('templates'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to create template");
  const data = await response.json();
  return transformTemplate(data.template || data);
}

export async function updateTemplate(template: Partial<Template> & { id: number }): Promise<Template> {
  const response = await fetch(getEndpoint('templateUpdate'), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateId: template.id,
      name: template.name,
      category: template.category,
      subcategory: template.subcategory,
      base_prompt: template.basePrompt,
      style: template.style,
      background: template.background,
      lighting: template.lighting,
      is_active: template.isActive,
    }),
  });
  if (!response.ok) throw new Error("Failed to update template");
  const data = await response.json();
  return transformTemplate(data.template || data);
}

// Projects
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(getEndpoint('projects'));
  if (!response.ok) throw new Error("Failed to fetch projects");
  const data = await response.json();
  const projects = data.projects || data || [];
  return projects.map(transformProject);
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const response = await fetch(getEndpoint('projects'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: project.name,
      input_folder_url: project.inputFolderUrl ?? "",
      input_folder_id: project.inputFolderId ?? null,
      output_folder_url: project.outputFolderUrl ?? "",
      output_folder_id: project.outputFolderId ?? null,
      template_id: project.templateId ?? null,
      custom_prompt: project.customPrompt ?? "",
      resolution: project.resolution ?? "2K",
      trial_count: project.trialCount ?? 5,
    }),
  });
  if (!response.ok) throw new Error("Failed to create project");
  const data = await response.json();
  return transformProject(data.project || data);
}

// Update project - uses /project-update endpoint
export async function updateProject(id: number, project: Partial<Project>): Promise<void> {
  const response = await fetch('https://automator.pixelcraftedmedia.com/webhook/image-optimizer/project-update', {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: id,
      name: project.name,
      input_folder_url: project.inputFolderUrl,
      input_folder_id: project.inputFolderId,
      output_folder_url: project.outputFolderUrl,
      output_folder_id: project.outputFolderId,
      template_id: project.templateId,
      custom_prompt: project.customPrompt,
      resolution: project.resolution,
      trial_count: project.trialCount,
    }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  
  // Don't parse response - just return void
}

// Project Images - fetches images from Google Drive folder with enriched data
export interface ProjectImage {
  id: string;
  name: string;
  mimeType?: string;
  thumbnailUrl: string;
  fullUrl: string;
  // Enriched fields from API
  status: 'completed' | 'pending';
  isOptimized: boolean;
  cost: number | null;
  timeSeconds: number | null;
  prompt: string | null;
  resolution: string | null;
  optimizedUrl: string | null;
  optimizedThumbnail: string | null;
  optimizedDriveId: string | null;
  completedAt: string | null;
}

export interface ProjectImagesResponse {
  success: boolean;
  projectId: number;
  projectName: string;
  inputFolderId: string;
  outputFolderId: string;
  totalImages: number;
  optimizedCount: number;
  pendingCount: number;
  totalCost: number;
  images: ProjectImage[];
}

export async function getProjectImages(projectId: number): Promise<ProjectImagesResponse> {
  const response = await fetch(`${getEndpoint('projectImages')}?projectId=${projectId}`);
  if (!response.ok) throw new Error("Failed to fetch project images");
  const data = await response.json();
  
  // Transform images to ensure consistent field names
  const images: ProjectImage[] = (data.images || []).map((img: any) => ({
    id: img.id,
    name: img.name,
    mimeType: img.mimeType,
    thumbnailUrl: img.thumbnailUrl,
    fullUrl: img.fullUrl,
    status: img.status || (img.isOptimized ? 'completed' : 'pending'),
    isOptimized: img.isOptimized !== undefined ? img.isOptimized : (img.status === 'completed'),
    cost: img.cost ?? null,
    timeSeconds: img.timeSeconds ?? null,
    prompt: img.prompt ?? null,
    resolution: img.resolution ?? null,
    optimizedUrl: img.optimizedUrl ?? null,
    optimizedThumbnail: img.optimizedThumbnail ?? null,
    optimizedDriveId: img.optimizedDriveId ?? null,
    completedAt: img.completedAt ?? null,
  }));
  
  return {
    success: data.success ?? true,
    projectId: data.projectId ?? projectId,
    projectName: data.projectName ?? '',
    inputFolderId: data.inputFolderId ?? '',
    outputFolderId: data.outputFolderId ?? '',
    totalImages: data.totalImages ?? images.length,
    optimizedCount: data.optimizedCount ?? images.filter(i => i.isOptimized).length,
    pendingCount: data.pendingCount ?? images.filter(i => !i.isOptimized).length,
    totalCost: data.totalCost ?? images.reduce((sum, i) => sum + (i.cost || 0), 0),
    images,
  };
}

// Start trial - processes selected images from project's input folder
export async function startTrial(
  projectId: number, 
  imageIds?: string[],
  imageNames?: Record<string, string>  // {fileId: fileName}
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(getEndpoint('trial'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, imageIds, imageNames }),
  });
  if (!response.ok) throw new Error("Failed to start trial");
  const data = await response.json();
  return {
    success: data.success ?? true,
    message: data.message ?? "Trial started",
  };
}

// Queue
export async function getQueue(): Promise<QueueItem[]> {
  const response = await fetch(getEndpoint('queue'));
  if (!response.ok) throw new Error("Failed to fetch queue");
  const data = await response.json();
  return data.queue || data || [];
}

// History - transforms snake_case to camelCase for prompt field
export async function getHistory(page = 1, limit = 20): Promise<{ history: HistoryItem[]; pagination: any }> {
  const response = await fetch(`${getEndpoint('history')}?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch history");
  const data = await response.json();
  const history = (data.history || []).map((item: any) => ({
    ...item,
    generatedPrompt: item.generatedPrompt || item.generated_prompt || null,
  }));
  return { history, pagination: data.pagination };
}

// Trigger processing (legacy)
export async function triggerProcessing(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(getEndpoint('trigger'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" }),
  });
  if (!response.ok) throw new Error("Failed to trigger processing");
  const data = await response.json();
  return {
    success: data.success !== false,
    message: data.message || "Processing started",
  };
}

// Process batch - sends selected images directly for processing
export async function processBatch(projectId: number, fileIds: string[]): Promise<{ success: boolean; message: string }> {
  const response = await fetch("https://automator.pixelcraftedmedia.com/webhook/image-optimizer/process-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, fileIds }),
  });
  if (!response.ok) throw new Error("Failed to process batch");
  const data = await response.json();
  return {
    success: data.success !== false,
    message: data.message || `Processing ${fileIds.length} images`,
  };
}

// Clear queue - removes all queued items
export async function clearQueue(): Promise<{ success: boolean; deletedCount: number }> {
  const response = await fetch("https://automator.pixelcraftedmedia.com/webhook/image-optimizer/queue-clear", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to clear queue");
  
  // Handle empty response body
  const text = await response.text();
  if (!text) {
    return { success: true, deletedCount: 0 };
  }
  
  try {
    const data = JSON.parse(text);
    return {
      success: data.success !== false,
      deletedCount: data.deletedCount ?? 0,
    };
  } catch {
    // If JSON parsing fails but response was OK, assume success
    return { success: true, deletedCount: 0 };
  }
}

// Redo image
export async function redoImage(fileId: string, fileName: string): Promise<{ success: boolean; queueId: number }> {
  const response = await fetch(getEndpoint('redo'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId, fileName }),
  });
  if (!response.ok) throw new Error("Failed to redo image");
  return response.json();
}
// Helper functions
export function getThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

export function parseFolderId(url: string): string | null {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Default export for convenience
export const api = {
  getSettings,
  updateSettings,
  getStats,
  getTemplates,
  createTemplate,
  getProjects,
  createProject,
  updateProject,
  getQueue,
  getHistory,
  triggerProcessing,
  processBatch,
  clearQueue,
  redoImage,
};

export default api;
