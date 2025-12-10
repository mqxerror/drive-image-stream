import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTemplate } from "@/services/api";
import { toast } from "sonner";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  defaultName?: string;
}

const CATEGORIES = [
  "Jewelry",
  "Fashion",
  "Electronics",
  "Food & Beverage",
  "Furniture",
  "Beauty",
  "Automotive",
  "Sports",
  "General",
];

export function SaveTemplateDialog({
  open,
  onOpenChange,
  prompt,
  defaultName = "",
}: SaveTemplateDialogProps) {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState("General");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsSaving(true);
    try {
      await createTemplate({
        name: name.trim(),
        category,
        subcategory: "",
        basePrompt: prompt,
        style: "Modern",
        background: "White",
        lighting: "",
        isSystem: false,
        isActive: true,
        createdBy: "user",
      });
      toast.success("Template saved successfully!");
      onOpenChange(false);
      setName("");
      setCategory("General");
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save as Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-xs">
              Template Name
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-category" className="text-xs">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="template-category" className="h-8 text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Prompt Preview</Label>
            <div className="p-2 rounded-md bg-muted/50 border border-border/40 max-h-24 overflow-y-auto">
              <p className="text-[10px] text-muted-foreground whitespace-pre-wrap">
                {prompt.slice(0, 200)}
                {prompt.length > 200 && "..."}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="text-xs"
          >
            {isSaving ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Save className="mr-1 h-3 w-3" />
            )}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
