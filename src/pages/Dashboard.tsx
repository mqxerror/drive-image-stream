import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { LiveActivity } from "@/components/dashboard/LiveActivity";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { NewProjectModal } from "@/components/modals/NewProjectModal";
import { ProjectSettingsModal } from "@/components/modals/ProjectSettingsModal";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";
import type { Project } from "@/services/api";

const Dashboard = () => {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);
  
  const {
    projects,
    stats,
    templates,
    isLoading,
    refresh,
    createProject,
  } = useProjects();

  const handleCreateProject = async (data: Partial<Project>) => {
    await createProject(data);
  };

  const handleOpenSettings = (project: Project) => {
    setSettingsProject(project);
  };

  const handleDelete = async (projectId: number) => {
    // TODO: Implement delete API call
    toast.info("Delete functionality coming soon");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header usageCount={stats?.totalProcessed} />

      <main className="container px-3 py-4 lg:px-4 lg:py-6 max-w-7xl">
        {/* Stats Cards */}
        <section className="animate-fade-in">
          <StatsCards stats={stats} />
        </section>

        {/* Live Activity */}
        <section className="mt-4 animate-fade-in-delay-1">
          <LiveActivity />
        </section>

        {/* Projects Section */}
        <section className="mt-4 animate-fade-in-delay-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold">Projects</h2>
              <p className="text-xs text-muted-foreground">
                Manage image optimization projects
              </p>
            </div>
            <Button size="sm" onClick={() => setIsNewProjectOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Button>
          </div>

          <ProjectsTable
            projects={projects}
            isLoading={isLoading}
            onRefresh={refresh}
            onOpenSettings={handleOpenSettings}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <NewProjectModal
        open={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
        templates={templates}
        onSubmit={handleCreateProject}
      />

      {settingsProject && (
        <ProjectSettingsModal
          open={!!settingsProject}
          onOpenChange={(open) => !open && setSettingsProject(null)}
          project={settingsProject}
          templates={templates}
          onSave={async () => {
            await refresh();
            setSettingsProject(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
