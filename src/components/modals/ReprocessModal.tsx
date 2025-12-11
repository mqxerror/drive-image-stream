import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReprocessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id: string;
    name: string;
    thumbnailUrl: string;
    prompt?: string;
  } | null;
  onReprocess: (fileId: string, fileName: string, customPrompt: string) => Promise<void>;
}

export function ReprocessModal({
  open,
  onOpenChange,
  file,
  onReprocess,
}: ReprocessModalProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize prompt when file changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && file?.prompt) {
      setCustomPrompt(file.prompt);
    }
    if (!isOpen) {
      setCustomPrompt("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!file || !customPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReprocess(file.id, file.name, customPrompt.trim());
      onOpenChange(false);
      setCustomPrompt("");
    } catch (error) {
      console.error("Reprocess error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reprocess Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Image Preview */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border/30 flex-shrink-0">
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Edit the prompt below to reprocess this image with new settings.
              </p>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="reprocess-prompt">Custom Prompt</Label>
            <Textarea
              id="reprocess-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt for reprocessing..."
              rows={6}
              className="resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              The image will be added to the queue with this custom prompt.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !customPrompt.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reprocess
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
