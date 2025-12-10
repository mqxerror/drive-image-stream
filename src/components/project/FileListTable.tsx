import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  CheckSquare,
  Square,
  Filter,
  Eye,
  RotateCcw,
  FlaskConical,
  ChevronDown,
  FileImage,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getEndpoint } from "@/hooks/useApiConfig";
import { getQueue, getHistory, triggerProcessing, type QueueItem, type HistoryItem } from "@/services/api";
import { ImageDetailModal } from "@/components/modals/ImageDetailModal";
import { toast } from "sonner";

export interface FileItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  status: "optimized" | "queued" | "processing" | "pending" | "failed";
  resultThumbnailUrl?: string;
  cost?: number;
  timeSeconds?: number;
  prompt?: string;
  optimizedDriveId?: string;
  optimizedUrl?: string;
  completedAt?: string;
  resolution?: string;
}

interface FileListTableProps {
  projectId: number;
  trialCount: number;
  onStartTrial: (selectedImageIds: string[]) => void;
  onQueueAndProcess?: (selectedImageIds: string[]) => void;
  isTrialLoading?: boolean;
  inputFolderId?: string | null;
}

type FilterType = "all" | "optimized" | "pending" | "processing";

export function FileListTable({
  projectId,
  trialCount,
  onStartTrial,
  onQueueAndProcess,
  isTrialLoading,
  inputFolderId,
}: FileListTableProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [imagesRes, queueData, historyData] = await Promise.all([
        fetch(`${getEndpoint("projectImages")}?projectId=${projectId}`).then((r) => r.json()),
        getQueue(),
        getHistory(1, 100),
      ]);

      const images = imagesRes.images || [];
      const queue = queueData || [];
      const history = historyData.history || [];

      // Create a map of file statuses from queue
      const queueMap = new Map<string, QueueItem>();
      queue.forEach((item: QueueItem) => {
        queueMap.set(item.fileId, item);
      });

      // Create a map of completed files from history
      const historyMap = new Map<string, HistoryItem>();
      history.forEach((item: HistoryItem) => {
        if (item.status === "completed" || item.optimizedDriveId) {
          historyMap.set(item.fileId, item);
        }
      });

      // Merge data
      const mergedFiles: FileItem[] = images.map((img: any) => {
        const queueItem = queueMap.get(img.id);
        const historyItem = historyMap.get(img.id);

        let status: FileItem["status"] = "pending";
        if (historyItem?.optimizedDriveId) {
          status = "optimized";
        } else if (queueItem) {
          if (queueItem.status === "queued") status = "queued";
          else if (queueItem.status === "processing" || queueItem.status === "optimizing") status = "processing";
          else if (queueItem.status === "failed") status = "failed";
        }

        return {
          id: img.id,
          name: img.name,
          thumbnailUrl: img.thumbnailUrl,
          status,
          resultThumbnailUrl: historyItem?.optimizedDriveId
            ? `https://drive.google.com/thumbnail?id=${historyItem.optimizedDriveId}&sz=w100`
            : undefined,
          cost: historyItem?.cost,
          timeSeconds: historyItem?.timeSeconds,
          prompt: (historyItem as any)?.generatedPrompt || (historyItem as any)?.generated_prompt,
          optimizedDriveId: historyItem?.optimizedDriveId || undefined,
          optimizedUrl: historyItem?.optimizedUrl || undefined,
          completedAt: historyItem?.completedAt,
          resolution: historyItem?.resolution,
        };
      });

      setFiles(mergedFiles);
    } catch (error) {
      console.error("Failed to fetch file data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    const pendingIds = files.filter((f) => f.status === "pending").map((f) => f.id);
    setSelectedIds(new Set(pendingIds));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const handleStartTrial = () => {
    onStartTrial(Array.from(selectedIds));
    toast.success(`${selectedIds.size} images added to queue`, {
      description: "Go to Dashboard to start processing",
    });
  };

  const handleQueueAndProcess = async () => {
    setIsProcessing(true);
    try {
      // First queue the images
      onStartTrial(Array.from(selectedIds));
      
      // Wait a moment for queue to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then trigger processing
      const result = await triggerProcessing();
      if (result.success) {
        toast.success(`Processing started! ${selectedIds.size} images queued`);
        setSelectedIds(new Set());
        fetchData();
      } else {
        toast.error("Failed to start processing");
      }
    } catch (error) {
      toast.error("Failed to start processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    if (filter === "all") return true;
    if (filter === "optimized") return f.status === "optimized";
    if (filter === "pending") return f.status === "pending";
    if (filter === "processing") return f.status === "processing" || f.status === "queued";
    return true;
  });

  const stats = {
    total: files.length,
    optimized: files.filter((f) => f.status === "optimized").length,
    inProgress: files.filter((f) => f.status === "processing" || f.status === "queued").length,
    pending: files.filter((f) => f.status === "pending").length,
    failed: files.filter((f) => f.status === "failed").length,
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: FileItem["status"]) => {
    const variants: Record<string, { className: string; label: string }> = {
      optimized: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", label: "Optimized" },
      queued: { className: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Queued" },
      processing: { className: "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse", label: "Processing" },
      pending: { className: "bg-muted text-muted-foreground border-border", label: "Pending" },
      failed: { className: "bg-red-500/10 text-red-400 border-red-500/30", label: "Failed" },
    };
    const v = variants[status];
    return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${v.className}`}>{v.label}</Badge>;
  };

  const getRowBorderClass = (status: FileItem["status"]) => {
    const borders: Record<string, string> = {
      optimized: "border-l-2 border-l-emerald-500",
      processing: "border-l-2 border-l-amber-500 animate-pulse",
      queued: "border-l-2 border-l-blue-500",
      failed: "border-l-2 border-l-red-500",
      pending: "border-l-2 border-l-transparent",
    };
    return borders[status] || "";
  };

  const openPreview = (file: FileItem) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
      </div>
    );
  }

  if (!inputFolderId) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-8 text-center">
        <FileImage className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-medium">No input folder configured</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Connect a Google Drive folder in project settings
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-8 text-center">
        <FileImage className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-medium">No images found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Add images to your Google Drive folder
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={fetchData}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Summary Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Total: <span className="text-foreground font-medium">{stats.total}</span></span>
          <span>Optimized: <span className="text-emerald-400 font-medium">{stats.optimized}</span></span>
          <span>In Progress: <span className="text-amber-400 font-medium">{stats.inProgress}</span></span>
          <span>Pending: <span className="text-foreground font-medium">{stats.pending}</span></span>
          {stats.failed > 0 && (
            <span>Failed: <span className="text-red-400 font-medium">{stats.failed}</span></span>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={selectAllPending}>
              <CheckSquare className="mr-1 h-3 w-3" />
              Select Pending
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={deselectAll}>
              <Square className="mr-1 h-3 w-3" />
              Deselect
            </Button>
            <span className="text-xs text-muted-foreground ml-1">
              {selectedIds.size} of {files.length} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Filter className="mr-1 h-3 w-3" />
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("optimized")}>Optimized</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("processing")}>Processing</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleStartTrial}
              disabled={selectedIds.size === 0 || isTrialLoading}
            >
              {isTrialLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <FlaskConical className="mr-1 h-3 w-3" />
              )}
              Add to Queue ({selectedIds.size})
            </Button>

            <Button
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90"
              onClick={handleQueueAndProcess}
              disabled={selectedIds.size === 0 || isTrialLoading || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-1 h-3 w-3" />
              )}
              Queue & Process ({selectedIds.size})
            </Button>
          </div>
        </div>

        {/* File Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-8 pl-2 pr-1"></TableHead>
                <TableHead className="w-14 px-1 text-xs">Original</TableHead>
                <TableHead className="w-14 px-1 text-xs">Result</TableHead>
                <TableHead className="text-xs">Filename</TableHead>
                <TableHead className="w-20 text-xs">Status</TableHead>
                <TableHead className="w-14 text-xs text-right">Cost</TableHead>
                <TableHead className="w-16 text-xs text-right">Time</TableHead>
                <TableHead className="w-32 text-xs">Prompt</TableHead>
                <TableHead className="w-16 text-xs text-right pr-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow
                  key={file.id}
                  className={`hover:bg-muted/30 border-border/30 ${getRowBorderClass(file.status)}`}
                >
                  <TableCell className="pl-2 pr-1 py-1.5">
                    {file.status === "pending" && (
                      <Checkbox
                        checked={selectedIds.has(file.id)}
                        onCheckedChange={() => toggleSelect(file.id)}
                        className="h-3.5 w-3.5"
                      />
                    )}
                  </TableCell>
                  <TableCell className="px-1 py-1.5">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                      <img
                        src={file.thumbnailUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1.5">
                    {file.resultThumbnailUrl ? (
                      <div
                        className="w-10 h-10 rounded bg-muted overflow-hidden cursor-pointer ring-1 ring-emerald-500/30 hover:ring-emerald-500/60 transition-all"
                        onClick={() => openPreview(file)}
                      >
                        <img
                          src={file.resultThumbnailUrl}
                          alt="Result"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                        -
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs truncate block max-w-[180px]">{file.name}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs">{file.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="py-1.5">{getStatusBadge(file.status)}</TableCell>
                  <TableCell className="py-1.5 text-xs text-right text-muted-foreground">
                    {file.cost ? `$${file.cost.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right text-muted-foreground">
                    {formatTime(file.timeSeconds)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {file.prompt ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] text-muted-foreground truncate block max-w-[120px] cursor-help">
                            {file.prompt.slice(0, 50)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-sm">
                          <p className="text-xs whitespace-pre-wrap">{file.prompt}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5 pr-2">
                    <div className="flex items-center justify-end gap-1">
                      {file.status === "optimized" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openPreview(file)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Preview Modal */}
        <ImageDetailModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          file={previewFile}
        />
      </div>
    </TooltipProvider>
  );
}
