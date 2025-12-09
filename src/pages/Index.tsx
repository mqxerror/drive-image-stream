import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { QueueItem } from "@/components/QueueItem";
import { HistoryTable } from "@/components/HistoryTable";
import { EmptyQueue } from "@/components/EmptyQueue";
import { useImageOptimizer } from "@/hooks/useImageOptimizer";
import {
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  Loader2,
} from "lucide-react";

const Index = () => {
  const {
    stats,
    queue,
    history,
    isLoading,
    isTriggering,
    refresh,
    triggerOptimizer,
  } = useImageOptimizer();

  // Map API queue items to component format
  const queueItems = queue.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    status: item.status,
    progress: item.progress,
    startedAt: item.startedAt,
  }));

  // Map API history items to component format
  const historyItems = history.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    status: item.status,
    completedAt: item.completedAt,
    costUsd: item.cost,
    resolution: item.resolution,
    processingTimeSec: item.timeSeconds,
    optimizedUrl: item.optimizedUrl,
  }));

  if (isLoading && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const inQueue = stats?.inQueue ?? 0;
  const currentlyProcessing = stats?.currentlyProcessing ?? 0;
  const processedToday = stats?.processedToday ?? 0;
  const percentChange = stats?.percentChangeFromYesterday ?? 0;
  const totalCost = stats?.totalCost ?? 0;
  const avgTime = stats?.avgTimeSeconds ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onRefresh={refresh}
        onTrigger={triggerOptimizer}
        isRefreshing={isLoading}
        isTriggering={isTriggering}
      />

      <main className="container px-4 py-8">
        {/* Stats Grid */}
        <section className="animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="In Queue"
              value={inQueue}
              subtitle={`${currentlyProcessing} currently processing`}
              icon={Layers}
              variant={currentlyProcessing > 0 ? "processing" : "default"}
            />
            <StatsCard
              title="Processed Today"
              value={processedToday}
              icon={CheckCircle2}
              variant="success"
              trend={percentChange >= 0 ? "up" : "down"}
              trendValue={`${Math.abs(percentChange)}% from yesterday`}
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
              value={`${avgTime}s`}
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
