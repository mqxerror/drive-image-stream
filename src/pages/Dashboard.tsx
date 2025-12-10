import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header usageCount={stats?.totalProcessed} />

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
