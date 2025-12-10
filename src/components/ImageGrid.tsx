import { ImageIcon, FlaskConical, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGridProps {
  isEmpty: boolean;
  trialCount: number;
  onStartTrial: () => void;
  isLoading?: boolean;
  inputFolderId?: string | null;
}

export function ImageGrid({ 
  isEmpty, 
  trialCount, 
  onStartTrial, 
  isLoading,
  inputFolderId,
}: ImageGridProps) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">No images yet</h3>
        
        {inputFolderId ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Start a trial to process your first images and preview the results before running a full batch
            </p>
            <Button 
              className="mt-6 bg-teal-600 hover:bg-teal-700" 
              onClick={onStartTrial} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FlaskConical className="mr-2 h-4 w-4" />
              )}
              Start Trial ({trialCount} images)
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Connect a Google Drive folder in project settings to preview and process images
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
              <FolderOpen className="h-5 w-5" />
              <span className="text-sm">No input folder configured</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Future: Render actual image grid here
  return null;
}
