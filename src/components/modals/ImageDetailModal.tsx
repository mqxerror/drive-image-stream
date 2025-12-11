import { useState } from "react";
import {
  ExternalLink,
  X,
  Clock,
  DollarSign,
  Calendar,
  Monitor,
  RotateCcw,
  Download,
  Copy,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface FileItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  status: string;
  resultThumbnailUrl?: string;
  cost?: number;
  timeSeconds?: number;
  prompt?: string;
  optimizedDriveId?: string;
  optimizedUrl?: string;
  completedAt?: string;
  resolution?: string;
}

interface ImageDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileItem | null;
  onSaveTemplate?: (prompt: string) => void;
  onReprocess?: (file: FileItem) => void;
}

export function ImageDetailModal({ 
  open, 
  onOpenChange, 
  file,
  onSaveTemplate,
  onReprocess 
}: ImageDetailModalProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!file) return null;

  const getLargeImageUrl = (driveId?: string) => {
    if (!driveId) return null;
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const getDownloadUrl = (driveId?: string) => {
    if (!driveId) return null;
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  };

  const copyPromptToClipboard = () => {
    if (file.prompt) {
      navigator.clipboard.writeText(file.prompt);
      toast.success("Prompt copied to clipboard");
    }
  };

  const handleSaveTemplate = () => {
    if (file.prompt && onSaveTemplate) {
      onSaveTemplate(file.prompt);
    }
  };

  const resultImageUrl = getLargeImageUrl(file.optimizedDriveId);
  const originalImageUrl = file.thumbnailUrl?.replace("sz=w100", "sz=w800") || file.thumbnailUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border/40 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium truncate pr-8">
              {file.name}
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

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-60px)] overflow-hidden">
          {/* Image Preview Section */}
          <div className="flex-1 p-4 border-r border-border/40 overflow-auto">
            {/* Before/After Toggle */}
            {file.optimizedDriveId && (
              <div className="flex items-center gap-1 mb-3">
                <Button
                  variant={!showOriginal ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowOriginal(false)}
                >
                  Result
                </Button>
                <Button
                  variant={showOriginal ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowOriginal(true)}
                >
                  Original
                </Button>
              </div>
            )}

            {/* Large Image */}
            <div className="rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
              {showOriginal ? (
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : resultImageUrl ? (
                <img
                  src={resultImageUrl}
                  alt="Result"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="text-muted-foreground text-sm">No preview available</div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <ScrollArea className="w-full lg:w-80 flex-shrink-0">
            <div className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Time</p>
                    <p className="text-xs font-medium">{formatTime(file.timeSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cost</p>
                    <p className="text-xs font-medium">{file.cost ? `$${file.cost.toFixed(2)}` : "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                    <p className="text-xs font-medium">{formatDate(file.completedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Resolution</p>
                    <p className="text-xs font-medium">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{file.resolution || "2K"}</Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Original Image Thumbnail */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Original Image</p>
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border/30">
                  <img
                    src={file.thumbnailUrl}
                    alt="Original"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>

              {/* AI Prompt Section */}
              {file.prompt && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">AI Prompt Used</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/70 border border-border/40 max-h-32 overflow-y-auto">
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {file.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={copyPromptToClipboard}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Prompt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={handleSaveTemplate}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save as Template
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {file.optimizedUrl && (
                  <Button size="sm" className="w-full text-xs" asChild>
                    <a href={file.optimizedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Open in Drive
                    </a>
                  </Button>
                )}
                {file.optimizedDriveId && (
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <a href={getDownloadUrl(file.optimizedDriveId)!} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => {
                    if (file && onReprocess) {
                      onReprocess(file);
                      onOpenChange(false);
                    }
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Redo
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
