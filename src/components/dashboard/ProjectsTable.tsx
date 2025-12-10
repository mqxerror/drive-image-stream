import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Pause, 
  Settings2, 
  Trash2, 
  ExternalLink,
  Loader2,
  FlaskConical,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { startTrial } from "@/services/api";
import type { Project } from "@/services/api";

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSettings: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

export function ProjectsTable({ 
  projects, 
  isLoading, 
  onRefresh,
  onOpenSettings,
  onDelete,
}: ProjectsTableProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(projects.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (projectId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, projectId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleRunTrial = async (projectId: number) => {
    setActionLoading(projectId);
    try {
      const result = await startTrial(projectId);
      if (result.success) {
        toast.success(result.message || "Trial started successfully");
        onRefresh();
      } else {
        toast.error(result.message || "Failed to start trial");
      }
    } catch (error) {
      toast.error("Failed to start trial");
      console.error("Trial error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getFolderName = (url: string): string => {
    if (!url) return "-";
    // Try to extract folder name from URL or show truncated URL
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1].substring(0, 12) + "...";
    }
    return url.length > 20 ? url.substring(0, 20) + "..." : url;
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead className="w-16"><Skeleton className="h-4 w-12" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-12" /></TableHead>
              <TableHead><Skeleton className="h-4 w-12" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FlaskConical className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to get started with image optimization
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedIds.length === projects.length && projects.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-16">Preview</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Input Folder</TableHead>
            <TableHead>Output Folder</TableHead>
            <TableHead className="text-center">Images</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedIds.includes(project.id)}
                  onCheckedChange={(checked) => handleSelectOne(project.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {project.totalImages > 0 ? (
                    <img 
                      src={`https://drive.google.com/thumbnail?id=${project.inputFolderId}&sz=w100`}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell>
                {project.inputFolderUrl ? (
                  <a 
                    href={project.inputFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getFolderName(project.inputFolderUrl)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {project.outputFolderUrl ? (
                  <a 
                    href={project.outputFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getFolderName(project.outputFolderUrl)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm">
                  {project.processedImages}/{project.totalImages}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCost(project.totalCost)}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRunTrial(project.id)}
                    disabled={actionLoading === project.id || project.status === 'processing'}
                    title="Run Trial"
                  >
                    {actionLoading === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FlaskConical className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onOpenSettings(project)}
                    title="Settings"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(project.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
