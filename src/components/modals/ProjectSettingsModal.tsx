import { useState, useEffect } from "react";
import { Loader2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseFolderId, updateProject } from "@/services/api";
import { toast } from "sonner";
import type { Project, Template } from "@/services/api";

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  templates: Template[];
  onSave: (updates: Partial<Project>) => Promise<void>;
}

export function ProjectSettingsModal({
  open,
  onOpenChange,
  project,
  templates,
  onSave,
}: ProjectSettingsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    templateId: project.templateId,
    resolution: project.resolution,
    customPrompt: project.customPrompt,
    inputFolderUrl: project.inputFolderUrl,
    inputFolderId: project.inputFolderId,
    outputFolderUrl: project.outputFolderUrl,
    outputFolderId: project.outputFolderId,
    trialCount: project.trialCount || 5,
  });

  // Reset form when project changes
  useEffect(() => {
    setFormData({
      name: project.name,
      templateId: project.templateId,
      resolution: project.resolution,
      customPrompt: project.customPrompt,
      inputFolderUrl: project.inputFolderUrl,
      inputFolderId: project.inputFolderId,
      outputFolderUrl: project.outputFolderUrl,
      outputFolderId: project.outputFolderId,
      trialCount: project.trialCount || 5,
    });
  }, [project]);

  const handleInputUrlChange = (url: string) => {
    const folderId = parseFolderId(url);
    setFormData({
      ...formData,
      inputFolderUrl: url,
      inputFolderId: folderId,
    });
  };

  const handleOutputUrlChange = (url: string) => {
    const folderId = parseFolderId(url);
    setFormData({
      ...formData,
      outputFolderUrl: url,
      outputFolderId: folderId,
    });
  };

  const handleTrialCountChange = (value: string) => {
    const num = parseInt(value) || 1;
    setFormData({
      ...formData,
      trialCount: Math.max(1, Math.min(10, num)),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call the API directly with proper format
      const result = await updateProject(project.id, formData);
      
      if (result.success) {
        toast.success("Settings saved successfully");
        // CRITICAL: Wait for parent to refresh data BEFORE closing
        await onSave(formData);
        // Now close after parent has refreshed
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Project name"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={formData.templateId?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  templateId: value ? parseInt(value) : null,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <RadioGroup
              value={formData.resolution}
              onValueChange={(value) =>
                setFormData({ ...formData, resolution: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2K" id="settings-res-2k" />
                <Label htmlFor="settings-res-2k" className="font-normal cursor-pointer">
                  2K ($0.12/image)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4K" id="settings-res-4k" />
                <Label htmlFor="settings-res-4k" className="font-normal cursor-pointer">
                  4K ($0.24/image)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Trial Images Count */}
          <div className="space-y-2">
            <Label htmlFor="trialCount">Trial Images</Label>
            <Input
              id="trialCount"
              type="number"
              min={1}
              max={10}
              value={formData.trialCount}
              onChange={(e) => handleTrialCountChange(e.target.value)}
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Number of images to process in a trial (1-10)
            </p>
          </div>

          {/* Input Folder URL */}
          <div className="space-y-2">
            <Label htmlFor="inputFolderUrl">Input Folder</Label>
            <Input
              id="inputFolderUrl"
              value={formData.inputFolderUrl}
              onChange={(e) => handleInputUrlChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Paste a Google Drive folder URL
            </p>
          </div>

          {/* Output Folder URL */}
          <div className="space-y-2">
            <Label htmlFor="outputFolderUrl">Output Folder</Label>
            <Input
              id="outputFolderUrl"
              value={formData.outputFolderUrl}
              onChange={(e) => handleOutputUrlChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Where optimized images will be saved
            </p>
          </div>

          {/* Custom Prompt Override */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Prompt Override</Label>
            <Textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) =>
                setFormData({ ...formData, customPrompt: e.target.value })
              }
              placeholder="Override the template prompt for this project..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the template prompt
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
