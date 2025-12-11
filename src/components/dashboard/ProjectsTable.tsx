import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings2, 
  Trash2, 
  Folder,
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

import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="rounded-lg border border-border/40 bg-card/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 py-2"><Skeleton className="h-3 w-3" /></TableHead>
              <TableHead className="w-12 py-2"><Skeleton className="h-3 w-8" /></TableHead>
              <TableHead className="py-2"><Skeleton className="h-3 w-20" /></TableHead>
              <TableHead className="py-2"><Skeleton className="h-3 w-14" /></TableHead>
              <TableHead className="py-2"><Skeleton className="h-3 w-10" /></TableHead>
              <TableHead className="py-2"><Skeleton className="h-3 w-10" /></TableHead>
              <TableHead className="py-2"><Skeleton className="h-3 w-16" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="py-2"><Skeleton className="h-3 w-3" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-7 w-7 rounded" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-3 w-24" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-3 w-8" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-3 w-10" /></TableCell>
                <TableCell className="py-2"><Skeleton className="h-6 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/40 bg-card/30 p-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Folder className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">No projects yet</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first project to get started
        </p>
      </div>
    );
  }


  return (
    <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="w-10 py-2 px-3">
              <Checkbox 
                checked={selectedIds.length === projects.length && projects.length > 0}
                onCheckedChange={handleSelectAll}
                className="h-3.5 w-3.5"
              />
            </TableHead>
            <TableHead className="w-12 py-2 px-2 text-xs">Preview</TableHead>
            <TableHead className="py-2 px-2 text-xs">Project</TableHead>
            
            <TableHead className="py-2 px-2 text-xs text-center">Images</TableHead>
            <TableHead className="py-2 px-2 text-xs text-right">Cost</TableHead>
            <TableHead className="py-2 px-2 text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors border-border/30"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <TableCell className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedIds.includes(project.id)}
                  onCheckedChange={(checked) => handleSelectOne(project.id, checked as boolean)}
                  className="h-3.5 w-3.5"
                />
              </TableCell>
              <TableCell className="py-2 px-2">
                <div className="h-7 w-7 rounded bg-muted/50 flex items-center justify-center">
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableCell>
              <TableCell className="py-2 px-2">
                <span className="text-xs font-medium">{project.name}</span>
              </TableCell>
              <TableCell className="py-2 px-2 text-center">
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{project.processedImages}</span>
                  /{project.totalImages}
                </span>
              </TableCell>
              <TableCell className="py-2 px-2 text-right">
                <span className="text-xs font-medium">{formatCost(project.totalCost)}</span>
              </TableCell>
              <TableCell className="py-2 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onOpenSettings(project)}
                    title="Settings"
                  >
                    <Settings2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDelete(project.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
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
