import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle, RotateCcw, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  fileId: string;
  fileName: string;
  status: "success" | "failed";
  completedAt: string;
  costUsd?: number;
  resolution?: string;
  processingTimeSec?: number;
  optimizedUrl?: string;
  optimizedDriveId?: string;
}

interface HistoryTableProps {
  items: HistoryItem[];
  className?: string;
  onRedo?: (fileId: string, fileName: string) => Promise<void>;
}

export function HistoryTable({ items, className, onRedo }: HistoryTableProps) {
  const [redoingIds, setRedoingIds] = useState<Set<string>>(new Set());

  const handleRedo = async (item: HistoryItem) => {
    if (!onRedo) return;
    setRedoingIds((prev) => new Set(prev).add(item.id));
    try {
      await onRedo(item.fileId, item.fileName);
    } finally {
      setRedoingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">No processing history yet</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground w-[70px]">Preview</TableHead>
            <TableHead className="font-semibold text-foreground">File</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Resolution</TableHead>
            <TableHead className="font-semibold text-foreground">Cost</TableHead>
            <TableHead className="font-semibold text-foreground">Time</TableHead>
            <TableHead className="font-semibold text-foreground">Completed</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-border">
              <TableCell className="p-2">
                {item.optimizedDriveId ? (
                  <img
                    src={`https://drive.google.com/thumbnail?id=${item.optimizedDriveId}&sz=w100`}
                    alt={item.fileName}
                    className="h-[50px] w-[50px] rounded object-cover bg-muted"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={cn(
                  "h-[50px] w-[50px] rounded bg-muted flex items-center justify-center",
                  item.optimizedDriveId && "hidden"
                )}>
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm max-w-[200px] truncate" title={item.fileName}>
                {item.fileName}
              </TableCell>
              <TableCell>
                {item.status === "success" ? (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">
                  {item.resolution || "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-warning">
                  {item.costUsd !== undefined ? `$${item.costUsd.toFixed(2)}` : "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">
                  {item.processingTimeSec !== undefined ? `${item.processingTimeSec}s` : "-"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(item.completedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRedo(item)}
                    disabled={redoingIds.has(item.id)}
                    title="Reprocess image"
                  >
                    {redoingIds.has(item.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </Button>
                  {item.optimizedUrl && (
                    <a
                      href={item.optimizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
