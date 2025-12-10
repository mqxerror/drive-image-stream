import { useState, useEffect, useCallback } from "react";
import { ImageIcon, Loader2, FlaskConical, CheckSquare, Square, FolderOpen, RefreshCw, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getProjectImages, type ProjectImage, type ProjectImagesResponse } from "@/services/api";

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
  const [data, setData] = useState<ProjectImagesResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async (showRefreshState = false) => {
    if (!projectId) return;
    
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectImages(projectId);
      setData(response);
    } catch (err) {
      console.error("Failed to fetch project images:", err);
      setError("Failed to load images");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchImages();
    // No auto-polling - only refresh on user action
  }, [fetchImages]);

  const handleRefresh = () => {
    fetchImages(true);
  };

  const images = data?.images || [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(existingId => existingId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAll = () => {
    // Only select pending (non-optimized) images
    const pendingIds = images.filter(img => !img.isOptimized).map(img => img.id);
    setSelectedIds(pendingIds);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const allPendingSelected = () => {
    const pendingIds = images.filter(img => !img.isOptimized).map(img => img.id);
    return pendingIds.length > 0 && pendingIds.every(id => selectedIds.includes(id));
  };

  const handleStartTrial = () => {
    const validIds = selectedIds.filter(id => {
      const img = images.find(i => i.id === id);
      return img && !img.isOptimized;
    });
    if (validIds.length > 0) {
      onStartTrial(validIds);
      setSelectedIds([]);
    }
  };

  const formatCost = (cost: number | null) => {
    if (cost === null || cost === undefined) return null;
    return `$${cost.toFixed(2)}`;
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return null;
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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
        <Button variant="outline" className="mt-4" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>
    );
  }

  const pendingCount = images.filter(i => !i.isOptimized).length;
  const selectedPendingCount = selectedIds.filter(id => {
    const img = images.find(i => i.id === id);
    return img && !img.isOptimized;
  }).length;

  // Image grid with selection
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-400 font-medium">{data?.optimizedCount || 0} Optimized</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-amber-400 font-medium">{data?.pendingCount || pendingCount} Pending</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-medium">Total Cost: <span className="text-primary">${(data?.totalCost || 0).toFixed(2)}</span></span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Selection toolbar */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={allPendingSelected() ? deselectAll : selectAll}
            >
              {allPendingSelected() ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select All
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedPendingCount} of {pendingCount} pending selected
            </span>
          </div>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleStartTrial}
            disabled={selectedPendingCount === 0 || isTrialLoading}
          >
            {isTrialLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Start Trial ({selectedPendingCount} selected)
          </Button>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image) => {
            const isOptimized = image.isOptimized;
            const canSelect = !isOptimized;
            const isSelected = selectedIds.includes(image.id);
            const displayThumbnail = isOptimized && image.optimizedThumbnail 
              ? image.optimizedThumbnail 
              : image.thumbnailUrl;

            return (
              <div
                key={image.id}
                className={`group relative cursor-pointer rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-teal-500 bg-teal-500/10"
                    : isOptimized
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-transparent hover:border-border"
                }`}
                onClick={() => canSelect && toggleSelect(image.id)}
              >
                {/* Checkbox - only for pending images */}
                {canSelect && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(image.id)}
                      className="bg-background/80 backdrop-blur-sm"
                    />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${
                      isOptimized 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {isOptimized ? "Completed" : "Pending"}
                  </Badge>
                </div>

                {/* Thumbnail */}
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={displayThumbnail}
                    alt={image.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Info section */}
                <div className="mt-2 px-1">
                  <p className="text-xs text-muted-foreground truncate" title={image.name}>
                    {image.name}
                  </p>
                  
                  {/* Cost and time for completed images */}
                  {isOptimized && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      {image.cost !== null && (
                        <span className="flex items-center gap-0.5">
                          <DollarSign className="h-2.5 w-2.5" />
                          {formatCost(image.cost)}
                        </span>
                      )}
                      {image.timeSeconds !== null && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(image.timeSeconds)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prompt tooltip for completed images */}
                  {isOptimized && image.prompt && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[10px] text-primary/70 truncate mt-1 cursor-help">
                          {image.prompt.length > 30 ? image.prompt.substring(0, 30) + "..." : image.prompt}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs whitespace-pre-wrap">{image.prompt}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
