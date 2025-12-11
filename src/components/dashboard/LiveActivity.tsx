import { useEffect, useState, useCallback } from "react";
import { Activity, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApiConfig } from "@/hooks/useApiConfig";

interface ActivityItem {
  id: number;
  filename: string;
  status: "queued" | "processing" | "optimizing" | "complete" | "failed";
  progress: number;
  thumbnailUrl?: string;
}

const statusConfig: Record<string, { label: string; className: string; animated?: boolean }> = {
  queued: { label: "Queued", className: "bg-info/20 text-info border-info/30" },
  processing: { label: "Processing", className: "bg-warning/20 text-warning border-warning/30", animated: true },
  optimizing: { label: "Optimizing", className: "bg-amber/20 text-amber border-amber/30", animated: true },
  complete: { label: "Complete", className: "bg-success/20 text-success border-success/30" },
  failed: { label: "Failed", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function LiveActivity() {
  const { getEndpoint } = useApiConfig();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivity = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    try {
      const response = await fetch(getEndpoint("queue"));
      if (response.ok) {
        const data = await response.json();
        // Show ALL items, no slicing
        const activityItems: ActivityItem[] = (data.queue || data || [])
          .map((item: any) => ({
            id: item.id,
            filename: item.fileName || item.filename || `Image ${item.id}`,
            status: item.status || "queued",
            progress: item.progress ?? 0,
            thumbnailUrl: item.thumbnailUrl,
          }));
        setItems(activityItems);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getEndpoint]);

  const handleRefresh = () => {
    fetchActivity(true);
  };

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Auto-refresh when processing is active
  useEffect(() => {
    const hasProcessingItems = items.some(
      (item) => item.status === "processing" || item.status === "optimizing"
    );
    if (hasProcessingItems) {
      const interval = setInterval(() => fetchActivity(), 5000);
      return () => clearInterval(interval);
    }
  }, [items, fetchActivity]);

  const isProcessingStatus = (status: string) => 
    status === "processing" || status === "optimizing";

  const hasProcessingItems = items.some((item) => 
    item.status === "processing" || item.status === "optimizing"
  );

  return (
    <Card className="border-border/40 bg-card/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Activity className="h-3.5 w-3.5 text-success" />
          {hasProcessingItems && (
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
        <h3 className="text-xs font-semibold">Live Activity</h3>
        {hasProcessingItems && (
          <span className="text-[9px] text-amber-400 animate-pulse ml-1">Processing Active</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-auto" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="text-center py-4 text-muted-foreground">
          <ImageIcon className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-[10px]">Queue Empty</p>
          <p className="text-[9px] mt-0.5">Add images to process</p>
        </div>
      ) : (
        <>
          {/* Scrollable queue list - show ALL items */}
          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
            {items.map((item) => {
              const config = statusConfig[item.status] || statusConfig.queued;
              const showProgress = isProcessingStatus(item.status);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail placeholder */}
                  <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-medium truncate flex-1">{item.filename}</p>
                      {showProgress && item.progress > 0 && (
                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {item.progress}%
                        </span>
                      )}
                    </div>
                    {showProgress && (
                      <Progress 
                        value={item.progress || 50} 
                        className="h-1 mt-1" 
                      />
                    )}
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 shrink-0 ${config.className} ${
                      config.animated ? "animate-pulse-glow" : ""
                    }`}
                  >
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Queue summary footer */}
          {items.length > 0 && (
            <div className="flex justify-between text-[10px] text-muted-foreground pt-2 mt-2 border-t border-border/40">
              <span>{items.filter(i => i.status === "queued").length} queued</span>
              <span>{items.filter(i => ["processing", "optimizing"].includes(i.status)).length} processing</span>
              <span>{items.length} total</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
