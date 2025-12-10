export interface Project {
  id: number;
  name: string;
  inputFolderUrl: string;
  inputFolderId: string;
  outputFolderUrl: string;
  outputFolderId: string;
  templateId: number | null;
  customPrompt: string | null;
  status: 'draft' | 'trial' | 'processing' | 'paused' | 'completed' | 'failed';
  resolution: '2K' | '4K';
  trialCount: number;
  trialCompleted: number;
  totalImages: number;
  processedImages: number;
  failedImages: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectImage {
  id: number;
  projectId: number;
  fileId: string;
  fileName: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  isTrial: boolean;
  customPrompt: string | null;
  templateId: number | null;
  optimizedUrl: string | null;
  optimizedDriveId: string | null;
  thumbnailUrl: string | null;
  cost: number | null;
  processingTime: number | null;
  errorMessage: string | null;
  completedAt: string | null;
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

export interface Stats {
  projectCount: number;
  processedThisMonth: number;
  totalCostThisMonth: number;
  avgTimeSeconds: number;
}

export interface UsageStats {
  imagesProcessed: number;
  totalCost: number;
  avgTime: number;
}

export interface Settings {
  defaultResolution: '2K' | '4K';
  defaultTrialCount: number;
  defaultTemplateId: number | null;
  cost2K: number;
  cost4K: number;
}
