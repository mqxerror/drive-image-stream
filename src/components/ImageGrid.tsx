import { useState } from "react";
import { ImageIcon, FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageGridProps {
  isEmpty: boolean;
  trialCount: number;
  onStartTrial: () => void;
  isLoading?: boolean;
}

export function ImageGrid({ 
  isEmpty, 
  trialCount, 
  onStartTrial, 
  isLoading: externalLoading 
}: ImageGridProps) {
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const { toast } = useToast();

  const handleStartTrial = async () => {
    setIsTrialLoading(true);
    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 800));
    toast({
      title: "Trial started",
      description: "Check back in a few minutes for your processed images",
    });
    setIsTrialLoading(false);
    onStartTrial();
  };

  const isLoading = externalLoading || isTrialLoading;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">No images yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Start a trial to process your first images and preview the results before running a full batch
        </p>
        <Button 
          className="mt-6 bg-teal-600 hover:bg-teal-700" 
          onClick={handleStartTrial} 
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
      </div>
    );
  }

  // Future: Render actual image grid here
  return null;
}
