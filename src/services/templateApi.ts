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

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.templates || [];
}

export async function createTemplate(template: any): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!res.ok) throw new Error('Failed to create');
  return (await res.json()).template;
}

export async function updateTemplate(id: number, template: any): Promise<void> {
  const res = await fetch(`${API_BASE}/template-update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId: id, ...template }),
  });
  if (!res.ok) throw new Error('Failed to update');
}

export async function deleteTemplate(id: number): Promise<void> {
  alert('Delete coming soon');
}
