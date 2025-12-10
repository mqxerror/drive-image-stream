import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Folder,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Settings,
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProjectThumbnails } from "./ProjectThumbnails";
import type { Project, ProjectImage } from "@/types";

interface ProjectCardProps {
  project: Project;
  images?: ProjectImage[];
  templateName?: string;
  onStartBatch?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isLoading?: boolean;
}

export function ProjectCard({
  project,
  images = [],
  templateName,
  onStartBatch,
  onPause,
  onResume,
  isLoading,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const progress = project.totalImages > 0
    ? Math.round((project.processedImages / project.totalImages) * 100)
    : 0;

  const statusConfig: Record<Project['status'], { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: null },
    trial: { label: `Trial (${project.trialCompleted}/${project.trialCount})`, color: "bg-purple-500/20 text-purple-400", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    processing: { label: "Processing", color: "bg-processing/20 text-processing", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    paused: { label: "Paused", color: "bg-warning/20 text-warning", icon: <Pause className="h-3 w-3" /> },
    completed: { label: "Completed", color: "bg-success/20 text-success", icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: "Failed", color: "bg-destructive/20 text-destructive", icon: <AlertCircle className="h-3 w-3" /> },
  };

  const status = statusConfig[project.status];
  const isTrialComplete = project.status === 'trial' && project.trialCompleted >= project.trialCount;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all hover:border-border hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                Template: {templateName || "Custom Prompt"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className={status.color}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                  {isTrialComplete && " ✓"}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {project.totalImages > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress}% ({project.processedImages}/{project.totalImages})
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {project.status === 'processing' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              disabled={isLoading}
            >
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Pause
            </Button>
          ) : project.status === 'paused' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              disabled={isLoading}
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </Button>
          ) : (project.status === 'draft' || isTrialComplete) && (
            <Button
              variant="default"
              size="sm"
              onClick={onStartBatch}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5" />
              )}
              Start Batch
            </Button>
          )}
          
          <Link to={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
          </Link>
          
          <Link to={`/projects/${project.id}?tab=settings`}>
            <Button variant="ghost" size="sm">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Expanded Thumbnails */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 p-4">
          <ProjectThumbnails
            images={images.slice(0, 6)}
            remainingCount={Math.max(0, images.length - 6)}
            projectId={project.id}
          />
        </div>
      )}
    </Card>
  );
}
