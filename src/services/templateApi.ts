const API_BASE = 'https://automator.pixelcraftedmedia.com/webhook/image-optimizer';

export interface Template {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  basePrompt: string;
  style: string;
  background: string;
  lighting: string;
  isSystem: boolean;
}

// GET all templates
export async function getTemplates(): Promise<Template[]> {
  const response = await fetch(`${API_BASE}/templates`);
  if (!response.ok) throw new Error('Failed to fetch templates');
  const data = await response.json();
  return data.templates || [];
}

// CREATE new template
export async function createTemplate(template: Omit<Template, 'id' | 'isSystem'>): Promise<Template> {
  const response = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: template.name,
      category: template.category || 'General',
      subcategory: template.subcategory || '',
      basePrompt: template.basePrompt || '',
      style: template.style || 'Modern',
      background: template.background || 'White',
      lighting: template.lighting || '',
    }),
  });
  if (!response.ok) throw new Error('Failed to create template');
  const data = await response.json();
  return data.template;
}

// UPDATE existing template
export async function updateTemplate(id: number, template: Partial<Template>): Promise<void> {
  const body = {
    templateId: id,
    name: template.name,
    category: template.category,
    subcategory: template.subcategory,
    basePrompt: template.basePrompt,
    style: template.style,
    background: template.background,
    lighting: template.lighting,
  };
  console.log('DEBUG updateTemplate API call - body:', JSON.stringify(body));
  
  const response = await fetch(`${API_BASE}/template-update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const responseData = await response.json();
  console.log('DEBUG updateTemplate API response:', JSON.stringify(responseData));
  
  if (!response.ok) throw new Error('Failed to update template');
}

// DELETE template
export async function deleteTemplate(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/template-delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId: id }),
  });
  if (!response.ok) throw new Error('Failed to delete template');
}
