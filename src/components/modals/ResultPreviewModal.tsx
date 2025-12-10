import { ExternalLink, X, Clock, DollarSign, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    id: number;
    fileName: string;
    optimizedDriveId: string | null;
    optimizedUrl: string | null;
    generatedPrompt: string | null;
    cost: number;
    timeSeconds: number;
    completedAt: string;
  } | null;
}

export function ResultPreviewModal({ open, onOpenChange, result }: ResultPreviewModalProps) {
  if (!result) return null;

  const getThumbnailUrl = (driveId: string | null, size: number = 800) => {
    if (!driveId) return null;
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium truncate pr-8">
              {result.fileName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-3 top-3"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-60px)]">
          <div className="p-4 space-y-4">
            {/* Image Preview */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
              {result.optimizedDriveId ? (
                <img
                  src={getThumbnailUrl(result.optimizedDriveId, 800)!}
                  alt={result.fileName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="text-muted-foreground text-sm">No preview available</div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(result.timeSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${result.cost.toFixed(2)}</span>
              </div>
              {result.completedAt && (
                <div className="text-muted-foreground/70 text-[10px] ml-auto">
                  {formatDate(result.completedAt)}
                </div>
              )}
            </div>

            {/* Generated Prompt */}
            {result.generatedPrompt && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Generated Prompt
                </div>
                <div className="p-3 rounded-md bg-muted/50 border border-border/40">
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {result.generatedPrompt}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              {result.optimizedUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <a
                    href={result.optimizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open in Drive
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs ml-auto"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
