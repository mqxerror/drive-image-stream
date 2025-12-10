import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, Copy, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTemplates, createTemplate } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@/types";

const Templates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = [...new Set(templates.map((t) => t.category))];
  
  const systemTemplates = templates.filter((t) => t.isSystem);
  const userTemplates = templates.filter((t) => !t.isSystem);

  const filterTemplates = (list: Template[]) => {
    return list.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.basePrompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.basePrompt);
    toast({ title: "Copied", description: "Prompt copied to clipboard." });
  };

  const handleDelete = async (template: Template) => {
    // Note: Delete functionality needs to be added to API
    toast({ title: "Info", description: "Delete functionality coming soon." });
  };

  const groupByCategory = (list: Template[]) => {
    const grouped: Record<string, Template[]> = {};
    list.forEach((t) => {
      if (!grouped[t.category]) {
        grouped[t.category] = [];
      }
      grouped[t.category].push(t);
    });
    return grouped;
  };

  const filteredSystem = groupByCategory(filterTemplates(systemTemplates));
  const filteredUser = filterTemplates(userTemplates);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Prompt Templates</h1>
            <p className="text-sm text-muted-foreground">
              Manage your image optimization prompts
            </p>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-9"
            />
          </div>
        </div>

        {/* System Templates */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">📌</span> System Templates
          </h2>

          {Object.entries(filteredSystem).map(([category, categoryTemplates]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category === 'Jewelry' && '💎'} {category === 'Fashion' && '👗'} {category}
              </h3>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Name</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Background</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.style}</Badge>
                        </TableCell>
                        <TableCell>{template.background}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopy(template)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </section>

        {/* User Templates */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>👤</span> My Templates
          </h2>

          {filteredUser.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-8 text-center">
              <p className="text-muted-foreground">No custom templates yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsNewModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Background</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUser.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.style}</Badge>
                      </TableCell>
                      <TableCell>{template.background}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(template)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2">{previewTemplate?.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Style:</span>
                <span className="ml-2">{previewTemplate?.style}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Background:</span>
                <span className="ml-2">{previewTemplate?.background}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Lighting:</span>
                <span className="ml-2">{previewTemplate?.lighting}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Base Prompt:</Label>
              <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm">
                {previewTemplate?.basePrompt}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => previewTemplate && handleCopy(previewTemplate)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <TemplateFormModal
        open={isNewModalOpen || !!editTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setIsNewModalOpen(false);
            setEditTemplate(null);
          }
        }}
        template={editTemplate}
        onSave={async () => {
          await fetchTemplates();
          setIsNewModalOpen(false);
          setEditTemplate(null);
        }}
      />
    </div>
  );
};

interface TemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: () => Promise<void>;
}

function TemplateFormModal({ open, onOpenChange, template, onSave }: TemplateFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    style: '',
    background: '',
    lighting: '',
    basePrompt: '',
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        subcategory: template.subcategory,
        style: template.style,
        background: template.background,
        lighting: template.lighting,
        basePrompt: template.basePrompt,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        style: '',
        background: '',
        lighting: '',
        basePrompt: '',
      });
    }
  }, [template]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const templateData = {
        ...formData,
        isSystem: false,
        isActive: true,
        createdBy: 'user',
      };
      
      await createTemplate(templateData);
      toast({ title: template ? "Updated" : "Created", description: `Template has been ${template ? 'updated' : 'created'}.` });
      await onSave();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Template name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Jewelry"
              />
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Input
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., Rings"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Input
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="e.g., Luxury"
              />
            </div>
            <div className="space-y-2">
              <Label>Background</Label>
              <Input
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                placeholder="e.g., White"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lighting</Label>
            <Input
              value={formData.lighting}
              onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
              placeholder="e.g., Studio softbox"
            />
          </div>

          <div className="space-y-2">
            <Label>Base Prompt</Label>
            <Textarea
              value={formData.basePrompt}
              onChange={(e) => setFormData({ ...formData, basePrompt: e.target.value })}
              placeholder="Professional jewelry photography..."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim() || !formData.basePrompt.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Templates;
