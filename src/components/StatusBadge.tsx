import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Pause, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { 
  label: string; 
  className: string; 
  icon?: React.ReactNode 
}> = {
  draft: { 
    label: "Draft", 
    className: "bg-muted text-muted-foreground" 
  },
  trial: { 
    label: "Trial", 
    className: "bg-purple-500/20 text-purple-400",
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  processing: { 
    label: "Processing", 
    className: "bg-processing/20 text-processing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  paused: { 
    label: "Paused", 
    className: "bg-warning/20 text-warning",
    icon: <Pause className="h-3 w-3" />
  },
  completed: { 
    label: "Completed", 
    className: "bg-success/20 text-success",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  failed: { 
    label: "Failed", 
    className: "bg-destructive/20 text-destructive",
    icon: <AlertCircle className="h-3 w-3" />
  },
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
    icon: <Clock className="h-3 w-3" />
  },
  queued: {
    label: "Queued",
    className: "bg-warning/20 text-warning",
    icon: <Clock className="h-3 w-3" />
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.draft;
  
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.icon}
      <span className={config.icon ? "ml-1" : ""}>{config.label}</span>
    </Badge>
  );
}
