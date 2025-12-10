import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  RotateCcw,
  FileEdit,
  Trash2,
  Eye,
  Play,
  FlaskConical,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
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
import { RedoModal } from "@/components/modals/RedoModal";
import { ImagePreviewModal } from "@/components/modals/ImagePreviewModal";
import { api, getThumbnailUrl } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectImage, Template } from "@/types";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [redoModalOpen, setRedoModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ProjectImage | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [projectData, imagesData, templatesData] = await Promise.all([
        api.getProject(parseInt(id)),
        api.getProjectImages(parseInt(id)),
        api.getTemplates(),
      ]);
      setProject(projectData);
      setImages(imagesData.images);
      setTemplates(templatesData.templates);
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(images.map((img) => img.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (imageId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, imageId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== imageId));
    }
  };

  const handleStartBatch = async () => {
    if (!project) return;
    setActionLoading(true);
    try {
      await api.startBatch(project.id);
      await fetchData();
      toast({ title: "Batch started", description: "Processing has begun." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start batch.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!project) return;
    setActionLoading(true);
    try {
      await api.startTrial(project.id);
      await fetchData();
      toast({ title: "Trial started", description: `Processing ${project.trialCount} trial images.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start trial.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedoSubmit = async (templateId?: number, customPrompt?: string, saveAsTemplate?: { name: string }) => {
    try {
      await api.redoBulk(selectedIds, templateId, customPrompt, saveAsTemplate);
      await fetchData();
      setSelectedIds([]);
      toast({ title: "Images queued", description: `${selectedIds.length} images queued for reprocessing.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to queue images.", variant: "destructive" });
    }
  };

  const statusIcons: Record<ProjectImage['status'], React.ReactNode> = {
    completed: <CheckCircle2 className="h-4 w-4 text-success" />,
    processing: <Loader2 className="h-4 w-4 text-processing animate-spin" />,
    queued: <Clock className="h-4 w-4 text-warning" />,
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    failed: <AlertCircle className="h-4 w-4 text-destructive" />,
  };

  const templateName = project?.templateId 
    ? templates.find((t) => t.id === project.templateId)?.name 
    : "Custom Prompt";

  const trialImages = images.filter((img) => img.isTrial);
  const trialComplete = trialImages.length > 0 && trialImages.every((img) => img.status === 'completed' || img.status === 'failed');
  const remainingCount = project ? project.totalImages - project.processedImages : 0;
  const costPerImage = project?.resolution === '4K' ? 0.24 : 0.12;
  const estimatedCost = remainingCount * costPerImage;
  const estimatedTime = Math.round((remainingCount * (project?.totalCost && project?.processedImages ? project.totalCost / project.processedImages / costPerImage * 60 : 70)) / 60);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-lg bg-card/50 border border-border/50">
          <Badge variant="secondary">
            Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          <Badge variant="outline">Template: {templateName}</Badge>
          <Badge variant="outline">Resolution: {project.resolution}</Badge>
        </div>

        {/* Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Checkbox
              checked={selectedIds.length === images.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <div className="flex-1" />
            <Button size="sm" onClick={() => setRedoModalOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Redo Selected
            </Button>
            <Button size="sm" variant="outline">
              <FileEdit className="mr-2 h-4 w-4" />
              Change Template
            </Button>
            <Button size="sm" variant="outline" className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}

        {/* Trial Results */}
        {trialImages.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Trial Results ({trialImages.filter(i => i.status === 'completed').length}/{project.trialCount} complete)
              </h2>
            </div>

            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-16">Preview</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-20">Time</TableHead>
                    <TableHead className="w-20">Cost</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialImages.map((image) => (
                    <TableRow key={image.id} className="hover:bg-muted/20">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(image.id)}
                          onCheckedChange={(checked) => handleSelect(image.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        {image.optimizedDriveId ? (
                          <img
                            src={getThumbnailUrl(image.optimizedDriveId, 100)}
                            alt={image.fileName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{image.fileName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {statusIcons[image.status]}
                          <span className="capitalize">{image.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{image.processingTime ? `${image.processingTime}s` : '-'}</TableCell>
                      <TableCell>{image.cost ? `$${image.cost.toFixed(2)}` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedIds([image.id]);
                              setRedoModalOpen(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewImage(image)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {/* Batch Info */}
        {trialComplete && remainingCount > 0 && (
          <div className="rounded-lg border border-border/50 bg-card/50 p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{remainingCount} images</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold">${estimatedCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="text-2xl font-bold">~{estimatedTime} min</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleStartBatch} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Start Full Batch
                </Button>
                <Button variant="outline" onClick={handleStartTrial} disabled={actionLoading}>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Run Another Trial
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold">No images yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a trial to process your first images
            </p>
            <Button className="mt-4" onClick={handleStartTrial} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
              Start Trial ({project.trialCount} images)
            </Button>
          </div>
        )}
      </main>

      <RedoModal
        open={redoModalOpen}
        onOpenChange={setRedoModalOpen}
        selectedCount={selectedIds.length}
        templates={templates}
        currentTemplateId={project.templateId}
        onSubmit={handleRedoSubmit}
      />

      <ImagePreviewModal
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
        image={previewImage}
        templateName={templateName}
        onRedo={() => {
          if (previewImage) {
            setSelectedIds([previewImage.id]);
            setPreviewImage(null);
            setRedoModalOpen(true);
          }
        }}
      />
    </div>
  );
};

export default ProjectDetail;
