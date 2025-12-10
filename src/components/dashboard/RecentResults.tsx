import { useEffect, useState } from "react";
import { Eye, Loader2, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useApiConfig } from "@/hooks/useApiConfig";
import { ResultPreviewModal } from "@/components/modals/ResultPreviewModal";

interface RecentResult {
  id: number;
  fileName: string;
  optimizedDriveId: string | null;
  optimizedUrl: string | null;
  generatedPrompt: string | null;
  cost: number;
  timeSeconds: number;
  completedAt: string;
}

export function RecentResults() {
  const { getEndpoint } = useApiConfig();
  const [results, setResults] = useState<RecentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<RecentResult | null>(null);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${getEndpoint("history")}?limit=6`);
      if (response.ok) {
        const data = await response.json();
        const historyItems = (data.history || data || [])
          .filter((item: any) => item.status === "completed" || item.optimizedDriveId)
          .slice(0, 6)
          .map((item: any) => ({
            id: item.id,
            fileName: item.fileName || item.filename || `Image ${item.id}`,
            optimizedDriveId: item.optimizedDriveId || item.optimized_drive_id,
            optimizedUrl: item.optimizedUrl || item.optimized_url,
            generatedPrompt: item.generatedPrompt || item.generated_prompt || null,
            cost: item.cost || 0,
            timeSeconds: item.timeSeconds || item.time_seconds || 0,
            completedAt: item.completedAt || item.completed_at || "",
          }));
        setResults(historyItems);
      }
    } catch (error) {
      console.error("Failed to fetch recent results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getThumbnailUrl = (driveId: string | null, size: number = 150) => {
    if (!driveId) return null;
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
  };

  const truncateFilename = (filename: string, maxLength: number = 18) => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop() || '';
    const nameWithoutExt = filename.slice(0, -(ext.length + 1));
    const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/50 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold">Recent Results</h3>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold">Recent Results</h3>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <ImageIcon className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-[10px]">No completed images yet</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/40 bg-card/50 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-semibold">Recent Results</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="group relative cursor-pointer"
              onClick={() => setSelectedResult(result)}
            >
              <div className="aspect-square rounded-md overflow-hidden bg-muted">
                {result.optimizedDriveId ? (
                  <img
                    src={getThumbnailUrl(result.optimizedDriveId, 150)!}
                    alt={result.fileName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Eye className="h-3 w-3" />
                    View
                  </div>
                </div>
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground truncate text-center">
                {truncateFilename(result.fileName)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <ResultPreviewModal
        open={!!selectedResult}
        onOpenChange={(open) => !open && setSelectedResult(null)}
        result={selectedResult}
      />
    </>
  );
}
