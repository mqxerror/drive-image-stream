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
  Expand,
  Copy,
  Save,
  RefreshCw,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getEndpoint } from "@/hooks/useApiConfig";
import { getQueue, getHistory, processBatch, type QueueItem, type HistoryItem } from "@/services/api";
import { ImageDetailModal } from "@/components/modals/ImageDetailModal";
import { SaveTemplateDialog } from "@/components/modals/SaveTemplateDialog";
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
  onStartTrial: (selectedImageIds: string[], imageNames: Record<string, string>) => Promise<void>;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectedPromptForSave, setSelectedPromptForSave] = useState("");
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
          prompt: historyItem?.generatedPrompt || undefined,
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
    // No auto-polling - only refresh on user action
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const pendingFiles = files.filter((f) => f.status !== "optimized");
    if (pendingFiles.length > 0 && pendingFiles.every(f => selectedIds.has(f.id))) {
      // All pending are selected, so deselect all
      setSelectedIds(new Set());
    } else {
      // Select all pending files
      setSelectedIds(new Set(pendingFiles.map((f) => f.id)));
    }
  };

  const isSelected = (id: string) => selectedIds.has(id);
  
  const isAllPendingSelected = () => {
    const pendingFiles = files.filter((f) => f.status !== "optimized");
    return pendingFiles.length > 0 && pendingFiles.every(f => selectedIds.has(f.id));
  };

  const handleStartTrial = async () => {
    // Only queue non-optimized images
    const validIds = Array.from(selectedIds).filter(id => {
      const file = files.find(f => f.id === id);
      return file && file.status !== "optimized";
    });
    
    if (validIds.length === 0) {
      toast.error("No pending images selected");
      return;
    }
    
    // Build imageNames map: {fileId: fileName}
    const imageNames: Record<string, string> = {};
    validIds.forEach(id => {
      const file = files.find(f => f.id === id);
      if (file) imageNames[id] = file.name;
    });
    
    // Call the parent's onStartTrial and wait for it to complete
    try {
      await onStartTrial(validIds, imageNames);
      // Only show success and clear selection after API completes
      toast.success(`${validIds.length} images added to queue`, {
        description: "Go to Dashboard to start processing",
      });
      setSelectedIds(new Set());
    } catch (error) {
      // Toast will be shown by parent component on error
      console.error("Add to queue failed:", error);
    }
  };

  const handleQueueAndProcess = async () => {
    // Only queue non-optimized images
    const validIds = Array.from(selectedIds).filter(id => {
      const file = files.find(f => f.id === id);
      return file && file.status !== "optimized";
    });
    
    if (validIds.length === 0) {
      toast.error("No pending images selected");
      return;
    }

    setIsProcessing(true);
    try {
      // Call the batch process endpoint directly
      const result = await processBatch(projectId, validIds);
      if (result.success) {
        toast.success(`Processing started!`, {
          description: `${validIds.length} images queued for processing`,
        });
        setSelectedIds(new Set());
        // Refresh after a short delay to allow backend to update
        setTimeout(() => fetchData(), 1000);
      } else {
        toast.error("Failed to start processing", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Batch process error:", error);
      toast.error("Failed to start processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPromptToClipboard = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  const openSaveTemplateDialog = (prompt: string) => {
    setSelectedPromptForSave(prompt);
    setSaveTemplateOpen(true);
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

  // Count only non-optimized selected items
  const selectedNonOptimizedCount = Array.from(selectedIds).filter(id => {
    const file = files.find(f => f.id === id);
    return file && file.status !== "optimized";
  }).length;

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

  // Check if a file can be selected (not optimized)
  const canSelect = (file: FileItem) => file.status !== "optimized";

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
        {/* Summary Stats with Refresh Button */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total: <span className="text-foreground font-medium">{stats.total}</span></span>
            <span>Optimized: <span className="text-emerald-400 font-medium">{stats.optimized}</span></span>
            <span>In Progress: <span className="text-amber-400 font-medium">{stats.inProgress}</span></span>
            <span>Pending: <span className="text-foreground font-medium">{stats.pending}</span></span>
            {stats.failed > 0 && (
              <span>Failed: <span className="text-red-400 font-medium">{stats.failed}</span></span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2" 
              onClick={handleSelectAll}
            >
              {isAllPendingSelected() ? (
                <>
                  <Square className="mr-1 h-3 w-3" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Select All
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground ml-1">
              {selectedIds.size} of {stats.pending + stats.inProgress + stats.failed} selected
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
              disabled={selectedNonOptimizedCount === 0 || isTrialLoading}
            >
              {isTrialLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <FlaskConical className="mr-1 h-3 w-3" />
              )}
              Add to Queue ({selectedNonOptimizedCount})
            </Button>

            <Button
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90"
              onClick={handleQueueAndProcess}
              disabled={selectedNonOptimizedCount === 0 || isTrialLoading || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-1 h-3 w-3" />
              )}
              Queue & Process ({selectedNonOptimizedCount})
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
                <TableHead className="w-40 text-xs">Prompt</TableHead>
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
                    {canSelect(file) && (
                      <Checkbox
                        checked={isSelected(file.id)}
                        onCheckedChange={() => handleSelectOne(file.id)}
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-1 text-left hover:bg-muted/50 rounded px-1 -mx-1 transition-colors group">
                            <span className="text-[10px] text-muted-foreground truncate block max-w-[120px]">
                              {file.prompt.length > 50 ? `${file.prompt.slice(0, 50)}...` : file.prompt}
                            </span>
                            <Expand className="h-2.5 w-2.5 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="left" align="start" className="w-80 p-3">
                          <div className="space-y-3">
                            <div className="max-h-40 overflow-y-auto">
                              <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                {file.prompt}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => copyPromptToClipboard(file.prompt!)}
                              >
                                <Copy className="h-2.5 w-2.5 mr-1" />
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={() => openSaveTemplateDialog(file.prompt!)}
                              >
                                <Save className="h-2.5 w-2.5 mr-1" />
                                Save as Template
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
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
          onSaveTemplate={openSaveTemplateDialog}
        />

        {/* Save Template Dialog */}
        <SaveTemplateDialog
          open={saveTemplateOpen}
          onOpenChange={setSaveTemplateOpen}
          prompt={selectedPromptForSave}
        />
      </div>
    </TooltipProvider>
  );
}
