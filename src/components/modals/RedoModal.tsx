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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Template } from "@/types";

interface RedoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  templates: Template[];
  currentTemplateId?: number | null;
  onSubmit: (templateId?: number, customPrompt?: string, saveAsTemplate?: { name: string }) => Promise<void>;
}

type RedoMode = 'keep' | 'different' | 'custom';

export function RedoModal({
  open,
  onOpenChange,
  selectedCount,
  templates,
  currentTemplateId,
  onSubmit,
}: RedoModalProps) {
  const [mode, setMode] = useState<RedoMode>('keep');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTemplateName = templates.find(t => t.id === currentTemplateId)?.name || 'Custom';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let templateId: number | undefined;
      let prompt: string | undefined;
      let saveTemplate: { name: string } | undefined;

      if (mode === 'keep') {
        templateId = currentTemplateId ?? undefined;
      } else if (mode === 'different' && selectedTemplateId) {
        templateId = parseInt(selectedTemplateId);
      } else if (mode === 'custom') {
        prompt = customPrompt;
        if (saveAsTemplate && newTemplateName.trim()) {
          saveTemplate = { name: newTemplateName.trim() };
        }
      }

      await onSubmit(templateId, prompt, saveTemplate);
      onOpenChange(false);
      
      // Reset form
      setMode('keep');
      setSelectedTemplateId('');
      setCustomPrompt('');
      setSaveAsTemplate(false);
      setNewTemplateName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Redo Images ({selectedCount} selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Choose how to reprocess:
          </p>

          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as RedoMode)}
            className="space-y-4"
          >
            {/* Keep Current */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="keep" id="keep" className="mt-1" />
              <Label htmlFor="keep" className="font-normal cursor-pointer">
                Keep current template ({currentTemplateName})
              </Label>
            </div>

            {/* Different Template */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="different" id="different" className="mt-1" />
                <Label htmlFor="different" className="font-normal cursor-pointer">
                  Use different template:
                </Label>
              </div>
              {mode === 'different' && (
                <div className="ml-6">
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.isActive && t.id !== currentTemplateId).map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Custom Prompt */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Write custom prompt:
                </Label>
              </div>
              {mode === 'custom' && (
                <div className="ml-6 space-y-4">
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Professional studio lighting, rose gold jewelry..."
                    rows={4}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveTemplate"
                        checked={saveAsTemplate}
                        onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                      />
                      <Label htmlFor="saveTemplate" className="font-normal cursor-pointer">
                        Save as new template
                      </Label>
                    </div>

                    {saveAsTemplate && (
                      <Input
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Template name"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (mode === 'different' && !selectedTemplateId) || (mode === 'custom' && !customPrompt.trim())}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Redo {selectedCount} Image{selectedCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
