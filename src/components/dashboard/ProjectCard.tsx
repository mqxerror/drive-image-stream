import { Link } from "react-router-dom";
import {
  Folder,
  Play,
  Pause,
  Settings,
  Eye,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import type { Project } from "@/services/api";

interface ProjectCardProps {
  project: Project;
  templateName?: string;
  onStartBatch?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isLoading?: boolean;
}

export function ProjectCard({
  project,
  templateName,
  onStartBatch,
  onPause,
  onResume,
  isLoading,
}: ProjectCardProps) {
  const progress = project.totalImages > 0
    ? Math.round((project.processedImages / project.totalImages) * 100)
    : 0;

  const isTrialComplete = project.status === 'trial' && project.trialCompleted >= project.trialCount;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground truncate">
                Template: {templateName || project.templateName || "Custom Prompt"}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <StatusBadge status={project.status} />
                <Badge variant="outline" className="border-border/50 text-xs">
                  {project.resolution}
                </Badge>
              </div>
            </div>
          </div>
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
            <Link to={`/projects/${project.id}`}>
              <Button
                variant="default"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                )}
                Start Batch
              </Button>
            </Link>
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
    </Card>
  );
}
