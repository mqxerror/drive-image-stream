// Re-export types from API service for backwards compatibility
export type {
  Project,
  Template,
  Settings,
  Stats,
  QueueItem,
  HistoryItem,
} from '@/services/api';

// Additional types for project images
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
