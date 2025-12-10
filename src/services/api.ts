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

// Stats - API returns: inQueue, processedToday, totalCost, avgTimeSeconds
export async function getStats(): Promise<Stats> {
  const response = await fetch(getEndpoint('stats'));
  if (!response.ok) throw new Error("Failed to fetch stats");
  const data = await response.json();
  return {
    totalProcessed: data.processedToday ?? data.totalProcessed ?? 0,
    totalPending: data.inQueue ?? data.totalPending ?? 0,
    totalFailed: 0, // Not available from API yet
    successRate: data.successRate ?? 100,
    averageProcessingTime: data.avgTimeSeconds ?? data.averageProcessingTime ?? 0,
    totalCost: data.totalCost ?? 0,
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
export async function updateProject(id: number, project: Partial<Project>): Promise<{ success: boolean; message: string; project?: Project }> {
  const response = await fetch(getEndpoint('projectUpdate'), {
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
  
  const data = await response.json();
  
  // Handle various success response formats from the API
  // API may return: { success: true }, empty object, or just the project data
  const isSuccess = response.ok && (data.success === true || data.success === undefined || Object.keys(data).length === 0);
  
  return {
    success: isSuccess,
    message: data.message ?? (isSuccess ? "Project updated successfully" : "Failed to update project"),
    project: data.project ? transformProject(data.project) : undefined,
  };
}

// Start trial - processes up to 3 images from project's input folder
export async function startTrial(projectId: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(getEndpoint('trial'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok) throw new Error("Failed to start trial");
  const data = await response.json();
  return {
    success: data.success ?? false,
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

// History
export async function getHistory(page = 1, limit = 20): Promise<{ history: HistoryItem[]; pagination: any }> {
  const response = await fetch(`${getEndpoint('history')}?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

// Trigger processing
export async function triggerProcessing(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(getEndpoint('trigger'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to trigger processing");
  return response.json();
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
  redoImage,
};

export default api;
