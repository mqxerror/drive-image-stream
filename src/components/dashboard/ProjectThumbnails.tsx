import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Clock, ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getThumbnailUrl } from "@/services/api";
import type { ProjectImage } from "@/types";

interface ProjectThumbnailsProps {
  images: ProjectImage[];
  remainingCount: number;
  projectId: number;
  selectedIds?: number[];
  onSelect?: (id: number, checked: boolean) => void;
}

export function ProjectThumbnails({
  images,
  remainingCount,
  projectId,
  selectedIds = [],
  onSelect,
}: ProjectThumbnailsProps) {
  const statusIcons: Record<ProjectImage['status'], React.ReactNode> = {
    completed: <CheckCircle2 className="h-3 w-3 text-success" />,
    processing: <Loader2 className="h-3 w-3 text-processing animate-spin" />,
    queued: <Clock className="h-3 w-3 text-warning" />,
    pending: <Clock className="h-3 w-3 text-muted-foreground" />,
    failed: <span className="text-destructive text-xs">!</span>,
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <ImageIcon className="h-8 w-8 mr-2 opacity-50" />
        <span>No images yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group rounded-lg overflow-hidden bg-muted border border-border/50 hover:border-primary/50 transition-all"
        >
          {onSelect && (
            <div className="absolute top-1 left-1 z-10">
              <Checkbox
                checked={selectedIds.includes(image.id)}
                onCheckedChange={(checked) => onSelect(image.id, checked as boolean)}
                className="bg-background/80 border-border"
              />
            </div>
          )}
          
          <div className="absolute top-1 right-1 z-10 rounded-full bg-background/80 p-1">
            {statusIcons[image.status]}
          </div>

          {image.optimizedDriveId ? (
            <img
              src={getThumbnailUrl(image.optimizedDriveId)}
              alt={image.fileName}
              className="h-14 w-14 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-14 w-14 flex items-center justify-center bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <Link
          to={`/projects/${projectId}`}
          className="h-14 w-14 rounded-lg border border-dashed border-border/50 flex items-center justify-center text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          +{remainingCount}
        </Link>
      )}
    </div>
  );
}
