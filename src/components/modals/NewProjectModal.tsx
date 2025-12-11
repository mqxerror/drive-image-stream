import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { parseFolderId } from "@/services/api";
import type { Template, Project } from "@/services/api";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onSubmit: (data: Partial<Project>) => Promise<void>;
  cost2K?: number;
  cost4K?: number;
}

export interface NewProjectData {
  name: string;
  inputFolderUrl: string;
  inputFolderId: string | null;
  outputFolderUrl: string;
  outputFolderId: string | null;
  templateId: number | null;
  customPrompt: string;
  resolution: '2K' | '4K';
  trialCount: number;
}

export function NewProjectModal({
  open,
  onOpenChange,
  templates,
  onSubmit,
  cost2K = 0.12,
  cost4K = 0.24,
}: NewProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [formData, setFormData] = useState<NewProjectData>({
    name: "",
    inputFolderUrl: "",
    inputFolderId: null,
    outputFolderUrl: "",
    outputFolderId: null,
    templateId: null,
    customPrompt: "",
    resolution: "2K",
    trialCount: 5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputUrlChange = (url: string) => {
    const folderId = parseFolderId(url);
    setFormData({
      ...formData,
      inputFolderUrl: url,
      inputFolderId: folderId,
    });
    if (url && !folderId) {
      setErrors({ ...errors, inputFolderUrl: "Invalid Google Drive folder URL" });
    } else {
      const newErrors = { ...errors };
      delete newErrors.inputFolderUrl;
      setErrors(newErrors);
    }
  };

  const handleOutputUrlChange = (url: string) => {
    const folderId = parseFolderId(url);
    setFormData({
      ...formData,
      outputFolderUrl: url,
      outputFolderId: folderId,
    });
    if (url && !folderId) {
      setErrors({ ...errors, outputFolderUrl: "Invalid Google Drive folder URL" });
    } else {
      const newErrors = { ...errors };
      delete newErrors.outputFolderUrl;
      setErrors(newErrors);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!formData.templateId && !formData.customPrompt?.trim()) {
      newErrors.template = "Select a template or write a custom prompt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        inputFolderUrl: formData.inputFolderUrl,
        inputFolderId: formData.inputFolderId,
        outputFolderUrl: formData.outputFolderUrl,
        outputFolderId: formData.outputFolderId,
        templateId: formData.templateId,
        customPrompt: formData.customPrompt,
        resolution: formData.resolution,
        trialCount: formData.trialCount,
      });
      onOpenChange(false);
      setFormData({
        name: "",
        inputFolderUrl: "",
        inputFolderId: null,
        outputFolderUrl: "",
        outputFolderId: null,
        templateId: null,
        customPrompt: "",
        resolution: "2K",
        trialCount: 5,
      });
      setShowCustomPrompt(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer 2025 Collection"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Prompt Template *</Label>
            <Select
              value={formData.templateId?.toString() || ""}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  templateId: value ? parseInt(value) : null,
                  customPrompt: "",
                });
                setShowCustomPrompt(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Collapsible open={showCustomPrompt} onOpenChange={setShowCustomPrompt}>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="h-auto p-0 text-sm">
                  Or write custom prompt ▼
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Textarea
                  value={formData.customPrompt}
                  onChange={(e) => setFormData({
                    ...formData,
                    customPrompt: e.target.value,
                    templateId: null,
                  })}
                  placeholder="Professional studio photography..."
                  rows={4}
                />
              </CollapsibleContent>
            </Collapsible>
            {errors.template && (
              <p className="text-sm text-destructive">{errors.template}</p>
            )}
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <RadioGroup
              value={formData.resolution}
              onValueChange={(value) => setFormData({ ...formData, resolution: value as '2K' | '4K' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2K" id="res-2k" />
                <Label htmlFor="res-2k" className="font-normal cursor-pointer">
                  2K (${cost2K.toFixed(2)}/image)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4K" id="res-4k" />
                <Label htmlFor="res-4k" className="font-normal cursor-pointer">
                  4K (${cost4K.toFixed(2)}/image)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input Folder (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="inputFolder">Input Folder (Google Drive link)</Label>
            <Input
              id="inputFolder"
              value={formData.inputFolderUrl}
              onChange={(e) => handleInputUrlChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/abc123..."
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Optional - paste the full Drive folder URL
            </p>
            {errors.inputFolderUrl && (
              <p className="text-sm text-destructive">{errors.inputFolderUrl}</p>
            )}
          </div>

          {/* Output Folder (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="outputFolder">Output Folder (Google Drive link)</Label>
            <Input
              id="outputFolder"
              value={formData.outputFolderUrl}
              onChange={(e) => handleOutputUrlChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/xyz789..."
            />
            {errors.outputFolderUrl && (
              <p className="text-sm text-destructive">{errors.outputFolderUrl}</p>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
