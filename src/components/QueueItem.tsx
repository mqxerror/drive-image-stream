import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Loader2, Image } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface QueueItemData {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "optimizing" | "success" | "failed";
  progress: number;
  startedAt?: string;
  error?: string;
}

interface QueueItemProps {
  item: QueueItemData;
  className?: string;
}

export function QueueItem({ item, className }: QueueItemProps) {
  const statusConfig: Record<
    QueueItemData["status"],
    { icon: typeof Clock; label: string; color: string; bgColor: string; animate?: boolean }
  > = {
    queued: {
      icon: Clock,
      label: "Queued",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      color: "text-processing",
      bgColor: "bg-processing/10",
      animate: true,
    },
    optimizing: {
      icon: Loader2,
      label: "Optimizing",
      color: "text-warning",
      bgColor: "bg-warning/10",
      animate: true,
    },
    success: {
      icon: CheckCircle2,
      label: "Complete",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Image className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-sm font-medium text-foreground">
              {item.fileName}
            </p>
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                config.bgColor,
                config.color
              )}
            >
              <StatusIcon
                className={cn(
                  "h-3 w-3",
                  config.animate && "animate-spin"
                )}
              />
              {config.label}
            </div>
          </div>

          {(item.status === "processing" || item.status === "optimizing") && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-mono">{item.progress}%</span>
              </div>
              <div className="relative">
                <Progress value={item.progress} className="h-1.5" />
                {item.progress < 100 && (
                  <div className="absolute inset-0 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="progress-bar-animated h-full rounded-full bg-primary/50"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {item.error && (
            <p className="text-xs text-destructive">{item.error}</p>
          )}

          {item.startedAt && (
            <p className="text-xs text-muted-foreground">
              Started {new Date(item.startedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
