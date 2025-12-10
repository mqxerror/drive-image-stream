import { useState } from "react";
import { Loader2 } from "lucide-react";
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
    templateId: project.templateId,
    resolution: project.resolution,
    customPrompt: project.customPrompt,
    inputFolderUrl: project.inputFolderUrl,
    outputFolderUrl: project.outputFolderUrl,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
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

          {/* Custom Prompt Override */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Prompt Override</Label>
            <Textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) =>
                setFormData({ ...formData, customPrompt: e.target.value })
              }
              placeholder="Override the template prompt..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the template prompt
            </p>
          </div>

          {/* Input Folder URL */}
          <div className="space-y-2">
            <Label htmlFor="inputFolderUrl">Input Folder URL</Label>
            <Input
              id="inputFolderUrl"
              value={formData.inputFolderUrl}
              onChange={(e) =>
                setFormData({ ...formData, inputFolderUrl: e.target.value })
              }
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          {/* Output Folder URL */}
          <div className="space-y-2">
            <Label htmlFor="outputFolderUrl">Output Folder URL</Label>
            <Input
              id="outputFolderUrl"
              value={formData.outputFolderUrl}
              onChange={(e) =>
                setFormData({ ...formData, outputFolderUrl: e.target.value })
              }
              placeholder="https://drive.google.com/drive/folders/..."
            />
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
