import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  getProjects, 
  getStats, 
  getTemplates, 
  createProject as apiCreateProject, 
  triggerProcessing 
} from "@/services/api";
import type { Project, Stats, Template } from "@/services/api";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchProjects(), fetchStats()]);
  }, [fetchProjects, fetchStats]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchStats(),
        fetchTemplates(),
      ]);
      setIsLoading(false);
    };
    init();

    const projectsInterval = setInterval(fetchProjects, 5000);
    const statsInterval = setInterval(fetchStats, 10000);

    return () => {
      clearInterval(projectsInterval);
      clearInterval(statsInterval);
    };
  }, [fetchProjects, fetchStats, fetchTemplates]);

  const createProject = async (data: Partial<Project>) => {
    try {
      const project = await apiCreateProject(data);
      setProjects((prev) => [...prev, project]);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      return project;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const startBatch = async (projectId: number) => {
    try {
      await triggerProcessing();
      await fetchProjects();
      toast({
        title: "Batch started",
        description: "Processing has begun.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start batch.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const pauseProject = async (projectId: number) => {
    try {
      await fetchProjects();
      toast({
        title: "Project paused",
        description: "Processing has been paused.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause project.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resumeProject = async (projectId: number) => {
    try {
      await triggerProcessing();
      await fetchProjects();
      toast({
        title: "Project resumed",
        description: "Processing has resumed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resume project.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTemplateName = (templateId: number | null): string | undefined => {
    if (!templateId) return undefined;
    return templates.find((t) => t.id === templateId)?.name;
  };

  return {
    projects,
    stats,
    templates,
    isLoading,
    refresh,
    createProject,
    startBatch,
    pauseProject,
    resumeProject,
    getTemplateName,
  };
}
