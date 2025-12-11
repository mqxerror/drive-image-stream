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
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  type Template 
} from "@/services/templateApi";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ['Jewelry', 'Product', 'Fashion', 'Food', 'Other'];
const STYLES = ['Premium', 'Elegant', 'Standard', 'Lifestyle', 'Minimal'];
const BACKGROUNDS = ['White', 'Gradient', 'Transparent', 'Natural', 'Custom'];

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
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = [...new Set(templates.map((t) => t.category))];

  const filterTemplates = (list: Template[]) => {
    return list.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.basePrompt || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.basePrompt || '');
    toast({ title: "Copied", description: "Prompt copied to clipboard." });
  };

  const handleDelete = async (template: Template) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await deleteTemplate(template.id);
      toast({ title: "Deleted", description: "Template has been deleted." });
      await fetchTemplates();
    } catch (error) {
      console.error('Delete template error:', error);
      toast({ title: "Error", description: "Failed to delete template.", variant: "destructive" });
    }
  };

  const groupByCategory = (list: Template[]) => {
    const grouped: Record<string, Template[]> = {};
    list.forEach((t) => {
      const cat = t.category || 'Other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(t);
    });
    return grouped;
  };

  const filteredTemplates = groupByCategory(filterTemplates(templates));

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

        {/* All Templates grouped by category */}
        {Object.entries(filteredTemplates).map(([category, categoryTemplates]) => (
          <section key={category} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {category === 'Jewelry' && '💎'}
              {category === 'Fashion' && '👗'}
              {category === 'Product' && '📦'}
              {category === 'Food' && '🍽️'}
              {category === 'Other' && '📁'}
              {category}
              <Badge variant="secondary" className="ml-2">{categoryTemplates.length}</Badge>
            </h2>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Background</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryTemplates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        {template.name}
                        {template.isSystem && (
                          <Badge variant="outline" className="ml-2 text-xs">System</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.subcategory || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.style || '-'}</Badge>
                      </TableCell>
                      <TableCell>{template.background || '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewTemplate(template)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditTemplate(template)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(template)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(template)}
                            title="Copy prompt"
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
          </section>
        ))}

        {Object.keys(filteredTemplates).length === 0 && (
          <div className="rounded-xl border border-dashed border-border/50 bg-card/30 p-8 text-center">
            <p className="text-muted-foreground">No templates found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsNewModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </div>
        )}
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
                <span className="text-muted-foreground">Subcategory:</span>
                <span className="ml-2">{previewTemplate?.subcategory || '-'}</span>
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
                <span className="ml-2">{previewTemplate?.lighting || '-'}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Base Prompt:</Label>
              <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {previewTemplate?.basePrompt || 'No prompt defined'}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              if (previewTemplate) {
                setPreviewTemplate(null);
                setEditTemplate(previewTemplate);
              }
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
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
    category: 'Product',
    subcategory: '',
    style: 'Standard',
    background: 'White',
    lighting: '',
    basePrompt: '',
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        category: template.category || 'Product',
        subcategory: template.subcategory || '',
        style: template.style || 'Standard',
        background: template.background || 'White',
        lighting: template.lighting || '',
        basePrompt: template.basePrompt || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Product',
        subcategory: '',
        style: 'Standard',
        background: 'White',
        lighting: '',
        basePrompt: '',
      });
    }
  }, [template, open]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Template name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (template?.id) {
        await updateTemplate(template.id, formData);
        toast({ title: "Updated", description: "Template has been updated." });
      } else {
        await createTemplate(formData);
        toast({ title: "Created", description: "Template has been created." });
      }
      await onSave();
    } catch (error) {
      console.error('Save template error:', error);
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
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Template name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Input
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., Rings, Necklaces"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select 
                value={formData.style} 
                onValueChange={(value) => setFormData({ ...formData, style: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Background</Label>
              <Select 
                value={formData.background} 
                onValueChange={(value) => setFormData({ ...formData, background: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  {BACKGROUNDS.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lighting</Label>
            <Input
              value={formData.lighting}
              onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
              placeholder="e.g., Studio softbox, Natural daylight"
            />
          </div>

          <div className="space-y-2">
            <Label>Base Prompt</Label>
            <Textarea
              value={formData.basePrompt}
              onChange={(e) => setFormData({ ...formData, basePrompt: e.target.value })}
              placeholder="Enter the base prompt for image optimization..."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              template ? 'Update Template' : 'Create Template'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Templates;
