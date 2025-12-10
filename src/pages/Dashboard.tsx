import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { NewProjectModal, NewProjectData } from "@/components/modals/NewProjectModal";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";

const Dashboard = () => {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const {
    projects,
    stats,
    templates,
    settings,
    isLoading,
    createProject,
    startBatch,
    pauseProject,
    resumeProject,
    getTemplateName,
  } = useProjects();

  const handleCreateProject = async (data: NewProjectData) => {
    await createProject(data);
  };

  const handleStartBatch = async (projectId: number) => {
    setActionLoading(projectId);
    try {
      await startBatch(projectId);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (projectId: number) => {
    setActionLoading(projectId);
    try {
      await pauseProject(projectId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (projectId: number) => {
    setActionLoading(projectId);
    try {
      await resumeProject(projectId);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header usageCount={stats?.processedToday} />

      <main className="container px-4 py-8">
        {/* Stats Cards */}
        <section className="animate-fade-in">
          <StatsCards stats={stats} />
        </section>

        {/* Projects Section */}
        <section className="mt-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">My Projects</h2>
              <p className="text-sm text-muted-foreground">
                Manage your image optimization projects
              </p>
            </div>
            <Button onClick={() => setIsNewProjectOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">No projects yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first project to get started
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsNewProjectOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  templateName={getTemplateName(project.templateId)}
                  onStartBatch={() => handleStartBatch(project.id)}
                  onPause={() => handlePause(project.id)}
                  onResume={() => handleResume(project.id)}
                  isLoading={actionLoading === project.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <NewProjectModal
        open={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
        templates={templates}
        onSubmit={handleCreateProject}
        cost2K={settings?.costPerImage2k}
        cost4K={settings?.costPerImage4k}
      />
    </div>
  );
};

export default Dashboard;
