import { useState, useEffect, useCallback } from "react";
import { ImageIcon, Loader2, FlaskConical, CheckSquare, Square, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { getEndpoint } from "@/hooks/useApiConfig";

export interface ProjectImage {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullUrl: string;
}

interface ProjectImageGridProps {
  projectId: number;
  trialCount: number;
  onStartTrial: (selectedImageIds: string[]) => void;
  isTrialLoading?: boolean;
  inputFolderId?: string | null;
}

export function ProjectImageGrid({
  projectId,
  trialCount,
  onStartTrial,
  isTrialLoading,
  inputFolderId,
}: ProjectImageGridProps) {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getEndpoint('projectImages')}?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch images");
      
      const data = await response.json();
      const imageList = data.images || [];
      setImages(imageList);
    } catch (err) {
      console.error("Failed to fetch project images:", err);
      setError("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(images.map(img => img.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleStartTrial = () => {
    onStartTrial(Array.from(selectedIds));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading images...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No input folder configured
  if (!inputFolderId) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">No input folder configured</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Connect a Google Drive folder in project settings to preview and process images
        </p>
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">No images found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          The input folder is empty. Add images to your Google Drive folder to get started.
        </p>
        <Button variant="outline" className="mt-4" onClick={fetchImages}>
          Refresh
        </Button>
      </div>
    );
  }

  // Image grid with selection
  return (
    <div className="space-y-4">
      {/* Selection toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-card/50 border border-border/50">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            <Square className="mr-2 h-4 w-4" />
            Deselect All
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} of {images.length} selected
          </span>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleStartTrial}
          disabled={selectedIds.size === 0 || isTrialLoading}
        >
          {isTrialLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FlaskConical className="mr-2 h-4 w-4" />
          )}
          Start Trial ({selectedIds.size} selected)
        </Button>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`group relative cursor-pointer rounded-lg border-2 transition-all ${
              selectedIds.has(image.id)
                ? "border-teal-500 bg-teal-500/10"
                : "border-transparent hover:border-border"
            }`}
            onClick={() => toggleSelect(image.id)}
          >
            {/* Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedIds.has(image.id)}
                onCheckedChange={() => toggleSelect(image.id)}
                className="bg-background/80 backdrop-blur-sm"
              />
            </div>

            {/* Thumbnail */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={image.thumbnailUrl}
                alt={image.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Filename */}
            <p className="mt-2 px-1 text-xs text-muted-foreground truncate" title={image.name}>
              {image.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
