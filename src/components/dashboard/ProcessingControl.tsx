import { useState, useEffect } from "react";
import { Play, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApiConfig } from "@/hooks/useApiConfig";
import { triggerProcessing } from "@/services/api";
import { toast } from "sonner";

interface ProcessingControlProps {
  onProcessingStarted?: () => void;
}

export function ProcessingControl({ onProcessingStarted }: ProcessingControlProps) {
  const { getEndpoint } = useApiConfig();
  const [queueCount, setQueueCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const costPerImage = 0.12;

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch(getEndpoint("queue"));
      if (response.ok) {
        const data = await response.json();
        const queue = data.queue || data || [];
        setQueueCount(queue.length);
        
        // Check if any are currently processing
        const processingItems = queue.filter(
          (item: any) => item.status === "processing" || item.status === "optimizing"
        );
        setIsProcessing(processingItems.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    }
  };

  useEffect(() => {
    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getProcessCount = () => {
    if (selectedOption === "all") return queueCount;
    if (selectedOption === "3") return Math.min(3, queueCount);
    if (selectedOption === "1") return Math.min(1, queueCount);
    return queueCount;
  };

  const estimatedCost = getProcessCount() * costPerImage;

  const handleStartProcessing = async () => {
    // Show confirmation for more than 10 images
    if (getProcessCount() > 10 && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    await executeProcessing();
  };

  const executeProcessing = async () => {
    setIsStarting(true);
    try {
      const result = await triggerProcessing();
      if (result.success) {
        toast.success("Processing started!", {
          description: `${queueCount} images in queue`,
        });
        setIsProcessing(true);
        onProcessingStarted?.();
        // Start polling for updates
        fetchQueueStatus();
      } else {
        toast.error(result.message || "Failed to start processing");
      }
    } catch (error) {
      toast.error("Failed to start processing");
    } finally {
      setIsStarting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleClearQueue = async () => {
    toast.info("Clear queue functionality coming soon");
  };

  if (queueCount === 0 && !isProcessing) {
    return (
      <Card className="border-border/40 bg-card/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold">Processing Control</h3>
        </div>
        <div className="text-center py-3 text-muted-foreground">
          <p className="text-xs">Queue Empty</p>
          <p className="text-[10px] mt-0.5">Add images from a project to process</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/40 bg-card/50 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Play className="h-3.5 w-3.5 text-primary" />
              {isProcessing && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <h3 className="text-xs font-semibold">Processing Control</h3>
          </div>
          {isProcessing && (
            <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Processing Active
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Queue Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Queue: <span className="text-foreground font-medium">{queueCount} images</span> ready
            </span>
          </div>

          {/* Processing Options */}
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="space-y-1.5"
            disabled={isProcessing}
          >
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" className="h-3 w-3" />
                <Label htmlFor="all" className="text-[11px] cursor-pointer">
                  Process All ({queueCount} images)
                </Label>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Est. ${(queueCount * costPerImage).toFixed(2)}
              </span>
            </div>
            
            {queueCount >= 3 && (
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="3" id="three" className="h-3 w-3" />
                  <Label htmlFor="three" className="text-[11px] cursor-pointer">
                    Process Next 3 images
                  </Label>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Est. ${(3 * costPerImage).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="one" className="h-3 w-3" />
                <Label htmlFor="one" className="text-[11px] cursor-pointer">
                  Process Next 1 image
                </Label>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Est. ${costPerImage.toFixed(2)}
              </span>
            </div>
          </RadioGroup>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleStartProcessing}
              disabled={isStarting || isProcessing || queueCount === 0}
            >
              {isStarting ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-1 h-3 w-3" />
              )}
              {isProcessing ? "Processing..." : "Start Processing"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClearQueue}
              disabled={isProcessing}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>

          {/* Cost Notice */}
          {!isProcessing && queueCount > 0 && (
            <p className="text-[10px] text-muted-foreground text-center">
              This will cost approximately <span className="text-foreground font-medium">${estimatedCost.toFixed(2)}</span>
            </p>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Confirm Large Batch
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              You're about to process <span className="font-medium text-foreground">{getProcessCount()} images</span>.
              <br />
              Estimated cost: <span className="font-medium text-foreground">${estimatedCost.toFixed(2)}</span>
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeProcessing} className="text-xs">
              Yes, Start Processing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
