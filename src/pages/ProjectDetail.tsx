import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Loader2,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { FileListTable } from "@/components/project/FileListTable";
import { ProjectSettingsModal } from "@/components/modals/ProjectSettingsModal";
import { getProjects, getTemplates, startTrial, updateProject } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Project, Template } from "@/services/api";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [projectsData, templatesData] = await Promise.all([
        getProjects(),
        getTemplates(),
      ]);
      const foundProject = projectsData.find(p => p.id === parseInt(id));
      if (foundProject) {
        setProject(foundProject);
      }
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast({
        title: "Error",
        description: "Failed to load project.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStartTrial = async (selectedImageIds: string[]) => {
    if (!project) return;
    setActionLoading(true);
    try {
      const result = await startTrial(project.id, selectedImageIds);
      if (result.success) {
        toast({ 
          title: "Trial started", 
          description: `Processing ${selectedImageIds.length} images...`
        });
        fetchData(); // Refresh project data
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to start trial",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start trial",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (updates: Partial<Project>) => {
    if (!project) return;
    try {
      const result = await updateProject(project.id, updates);
      if (result.success) {
        setProject(result.project || { ...project, ...updates });
        toast({
          title: "Settings saved",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const templateName = project?.templateId
    ? templates.find((t) => t.id === project.templateId)?.name 
    : project?.templateName || "Custom Prompt";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">Project not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The project you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-lg bg-card/50 border border-border/50 animate-fade-in">
          <StatusBadge status={project.status} />
          <Badge variant="outline" className="border-border/50">
            Template: {templateName}
          </Badge>
          <Badge variant="outline" className="border-border/50">
            Resolution: {project.resolution}
          </Badge>
          {project.totalImages > 0 && (
            <Badge variant="outline" className="border-border/50">
              {project.processedImages}/{project.totalImages} processed
            </Badge>
          )}
          {project.inputFolderUrl && (
            <a
              href={project.inputFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open Input Folder in Google Drive
            </a>
          )}
        </div>

        {/* File List Table */}
        <div className="animate-fade-in">
          <FileListTable
            projectId={project.id}
            trialCount={project.trialCount || 5}
            onStartTrial={handleStartTrial}
            isTrialLoading={actionLoading}
            inputFolderId={project.inputFolderId}
          />
        </div>
      </main>

      <ProjectSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        project={project}
        templates={templates}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default ProjectDetail;
