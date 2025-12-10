import { useEffect, useState } from "react";
import { Activity, ImageIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useApiConfig } from "@/hooks/useApiConfig";

interface ActivityItem {
  id: number;
  filename: string;
  status: "queued" | "processing" | "optimizing" | "complete" | "failed";
  progress?: number;
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

  const fetchActivity = async () => {
    try {
      const response = await fetch(getEndpoint("queue"));
      if (response.ok) {
        const data = await response.json();
        // Transform queue data to activity items (take first 5)
        const activityItems: ActivityItem[] = (data.queue || data || [])
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            filename: item.fileName || item.filename || `Image ${item.id}`,
            status: item.status || "queued",
            progress: item.progress,
            thumbnailUrl: item.thumbnailUrl,
          }));
        setItems(activityItems);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border/40 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Activity className="h-4 w-4 text-success" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
        <h3 className="text-sm font-semibold">Live Activity</h3>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="text-center py-6 text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No active processing</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const config = statusConfig[item.status] || statusConfig.queued;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Thumbnail placeholder */}
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.filename}</p>
                  {(item.status === "processing" || item.status === "optimizing") && (
                    <Progress value={item.progress ?? 50} className="h-1 mt-1" />
                  )}
                </div>

                {/* Status badge */}
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 shrink-0 ${config.className} ${
                    config.animated ? "animate-pulse-glow" : ""
                  }`}
                >
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
