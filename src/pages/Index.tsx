import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { QueueItem, QueueItemData } from "@/components/QueueItem";
import { HistoryTable, HistoryItem } from "@/components/HistoryTable";
import { EmptyQueue } from "@/components/EmptyQueue";
import { useToast } from "@/hooks/use-toast";
import {
  Image,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";

// Demo data - In production, this would come from NocoDB via the n8n workflow
const demoQueueItems: QueueItemData[] = [
  {
    id: "1",
    fileName: "gold-ring-001.jpg",
    status: "optimizing",
    progress: 65,
    startedAt: new Date().toISOString(),
  },
  {
    id: "2",
    fileName: "diamond-necklace-002.png",
    status: "processing",
    progress: 35,
    startedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "3",
    fileName: "silver-bracelet-003.jpg",
    status: "queued",
    progress: 10,
  },
];

const demoHistoryItems: HistoryItem[] = [
  {
    id: "h1",
    fileName: "pearl-earrings-001.jpg",
    status: "success",
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    costUsd: 0.12,
    resolution: "2K",
    processingTimeSec: 45,
    optimizedUrl: "https://drive.google.com/file/d/example1/view",
  },
  {
    id: "h2",
    fileName: "gold-chain-002.png",
    status: "success",
    completedAt: new Date(Date.now() - 7200000).toISOString(),
    costUsd: 0.24,
    resolution: "4K",
    processingTimeSec: 78,
    optimizedUrl: "https://drive.google.com/file/d/example2/view",
  },
  {
    id: "h3",
    fileName: "vintage-brooch-003.jpg",
    status: "failed",
    completedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "h4",
    fileName: "engagement-ring-004.jpg",
    status: "success",
    completedAt: new Date(Date.now() - 14400000).toISOString(),
    costUsd: 0.12,
    resolution: "2K",
    processingTimeSec: 52,
    optimizedUrl: "https://drive.google.com/file/d/example4/view",
  },
];

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [queueItems] = useState<QueueItemData[]>(demoQueueItems);
  const [historyItems] = useState<HistoryItem[]>(demoHistoryItems);
  const { toast } = useToast();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated",
    });
  }, [toast]);

  const handleTrigger = useCallback(async () => {
    setIsTriggering(true);
    toast({
      title: "Workflow Triggered",
      description: "The image optimizer workflow has been started",
    });
    // Simulate workflow trigger
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTriggering(false);
  }, [toast]);

  // Calculate stats
  const totalProcessed = historyItems.filter((i) => i.status === "success").length;
  const totalCost = historyItems.reduce((sum, i) => sum + (i.costUsd || 0), 0);
  const queueCount = queueItems.length;
  const processingCount = queueItems.filter(
    (i) => i.status === "processing" || i.status === "optimizing"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onRefresh={handleRefresh}
        onTrigger={handleTrigger}
        isRefreshing={isRefreshing}
        isTriggering={isTriggering}
      />

      <main className="container px-4 py-8">
        {/* Stats Grid */}
        <section className="animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="In Queue"
              value={queueCount}
              subtitle={`${processingCount} currently processing`}
              icon={Layers}
              variant={processingCount > 0 ? "processing" : "default"}
            />
            <StatsCard
              title="Processed Today"
              value={totalProcessed}
              icon={CheckCircle2}
              variant="success"
              trend="up"
              trendValue="12% from yesterday"
            />
            <StatsCard
              title="Total Cost"
              value={`$${totalCost.toFixed(2)}`}
              subtitle="This session"
              icon={DollarSign}
              variant="warning"
            />
            <StatsCard
              title="Avg. Time"
              value="52s"
              subtitle="Per image"
              icon={Clock}
            />
          </div>
        </section>

        {/* Queue Section */}
        <section className="mt-8 animate-fade-in-delay-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Processing Queue
              </h2>
              <p className="text-sm text-muted-foreground">
                Images currently being optimized
              </p>
            </div>
          </div>

          {queueItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {queueItems.map((item) => (
                <QueueItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyQueue />
          )}
        </section>

        {/* History Section */}
        <section className="mt-8 animate-fade-in-delay-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Processing History
            </h2>
            <p className="text-sm text-muted-foreground">
              Recently optimized images
            </p>
          </div>

          <HistoryTable items={historyItems} />
        </section>
      </main>
    </div>
  );
};

export default Index;
