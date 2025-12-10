import { RotateCcw, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getThumbnailUrl } from "@/services/api";
import type { ProjectImage } from "@/types";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ProjectImage | null;
  templateName?: string;
  prompt?: string;
  onRedo?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ImagePreviewModal({
  open,
  onOpenChange,
  image,
  templateName,
  prompt,
  onRedo,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ImagePreviewModalProps) {
  if (!image) return null;

  const originalUrl = image.fileId 
    ? getThumbnailUrl(image.fileId, 600)
    : null;
    
  const optimizedUrl = image.optimizedDriveId
    ? getThumbnailUrl(image.optimizedDriveId, 600)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{image.fileName}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground text-center">Original</p>
              <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {originalUrl ? (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground text-center">Optimized</p>
              <div className="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                {optimizedUrl ? (
                  <img
                    src={optimizedUrl}
                    alt="Optimized"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            {templateName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template Used:</span>
                <span className="font-medium">{templateName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing Time:</span>
              <span className="font-medium">{image.processingTime ? `${image.processingTime} seconds` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium">{image.cost ? `$${image.cost.toFixed(2)}` : '-'}</span>
            </div>
          </div>

          {/* Prompt */}
          {(prompt || image.customPrompt) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Prompt:</p>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                {prompt || image.customPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {onPrev && (
              <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Button>
            )}
            {onNext && (
              <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onRedo && (
              <Button variant="outline" size="sm" onClick={onRedo}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Redo
              </Button>
            )}
            {image.optimizedUrl && (
              <a href={image.optimizedUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
