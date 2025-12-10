import { useState, useEffect, useCallback } from 'react';
import { api, Stats, QueueItem, HistoryItem } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UseImageOptimizerReturn {
  stats: Stats | null;
  queue: QueueItem[];
  history: HistoryItem[];
  isLoading: boolean;
  isTriggering: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  triggerOptimizer: () => Promise<void>;
  redoImage: (fileId: string, fileName: string) => Promise<void>;
}

export function useImageOptimizer(): UseImageOptimizerReturn {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await api.getQueue();
      setQueue(data.queue);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api.getHistory();
      setHistory(data.history);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchStats(), fetchQueue(), fetchHistory()]);
      toast({
        title: "Refreshed",
        description: "Dashboard data has been updated",
      });
    } catch (err) {
      setError('Failed to refresh data');
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchQueue, fetchHistory, toast]);

  const triggerOptimizer = useCallback(async () => {
    setIsTriggering(true);
    try {
      await api.triggerOptimizer();
      toast({
        title: "Workflow Triggered",
        description: "The image optimizer workflow has been started",
      });
      // Refresh queue after triggering
      await fetchQueue();
      await fetchStats();
    } catch (err) {
      console.error('Failed to trigger optimizer:', err);
      toast({
        title: "Error",
        description: "Failed to trigger the optimizer workflow",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  }, [fetchQueue, fetchStats, toast]);

  const redoImage = useCallback(async (fileId: string, fileName: string) => {
    try {
      await api.redoImage(fileId, fileName);
      toast({
        title: "Image Queued",
        description: "Image queued for reprocessing",
      });
      // Refresh queue and history
      await Promise.all([fetchQueue(), fetchHistory(), fetchStats()]);
    } catch (err) {
      console.error('Failed to redo image:', err);
      toast({
        title: "Error",
        description: "Failed to queue image for reprocessing",
        variant: "destructive",
      });
    }
  }, [fetchQueue, fetchHistory, fetchStats, toast]);

  // Initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchQueue(), fetchHistory()]);
      setIsLoading(false);
    };
    initialFetch();
  }, [fetchStats, fetchQueue, fetchHistory]);

  // Polling intervals
  useEffect(() => {
    // Stats: every 5 seconds
    const statsInterval = setInterval(fetchStats, 5000);
    
    // Queue: every 3 seconds
    const queueInterval = setInterval(fetchQueue, 3000);
    
    // History: every 10 seconds
    const historyInterval = setInterval(fetchHistory, 10000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(queueInterval);
      clearInterval(historyInterval);
    };
  }, [fetchStats, fetchQueue, fetchHistory]);

  return {
    stats,
    queue,
    history,
    isLoading,
    isTriggering,
    error,
    refresh,
    triggerOptimizer,
    redoImage,
  };
}
