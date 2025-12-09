import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  fileName: string;
  status: "success" | "failed";
  completedAt: string;
  costUsd?: number;
  resolution?: string;
  processingTimeSec?: number;
  optimizedUrl?: string;
}

interface HistoryTableProps {
  items: HistoryItem[];
  className?: string;
}

export function HistoryTable({ items, className }: HistoryTableProps) {
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
            <TableHead className="font-semibold text-foreground">File</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Resolution</TableHead>
            <TableHead className="font-semibold text-foreground">Cost</TableHead>
            <TableHead className="font-semibold text-foreground">Time</TableHead>
            <TableHead className="font-semibold text-foreground">Completed</TableHead>
            <TableHead className="font-semibold text-foreground sr-only">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
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
                  {item.costUsd ? `$${item.costUsd.toFixed(2)}` : "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">
                  {item.processingTimeSec ? `${item.processingTimeSec}s` : "-"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(item.completedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {item.optimizedUrl && (
                  <a
                    href={item.optimizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
