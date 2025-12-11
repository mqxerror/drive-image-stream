const BASE_URL = import.meta.env.VITE_NOCODB_BASE_URL;
const TOKEN = import.meta.env.VITE_NOCODB_API_TOKEN;
const TABLE_ID = import.meta.env.VITE_NOCODB_TEMPLATES_TABLE_ID;

console.log('NocoDB Config:', {
  BASE_URL,
  TOKEN: TOKEN ? 'SET (hidden)' : 'NOT SET',
  TABLE_ID,
});

const headers = {
  'Content-Type': 'application/json',
  'xc-token': TOKEN,
};

export interface NocoDBTemplate {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  basePrompt: string;
  style: string;
  background: string;
  lighting: string;
  isSystem: boolean;
  isActive: boolean;
}

// Map NocoDB record to frontend Template
function mapRecord(record: any): NocoDBTemplate {
  return {
    id: record.Id,
    name: record.Title || '',
    category: record.category || '',
    subcategory: record.subcategory || '',
    basePrompt: record.base_prompt || '',
    style: record.style || '',
    background: record.background || '',
    lighting: record.lighting || '',
    isSystem: record.is_system ?? false,
    isActive: record.is_active ?? true,
  };
}

// GET all templates
export async function getTemplates(): Promise<NocoDBTemplate[]> {
  const res = await fetch(`${BASE_URL}/api/v2/tables/${TABLE_ID}/records?limit=100`, { headers });
  if (!res.ok) throw new Error('Failed to fetch templates');
  const data = await res.json();
  return (data.list || []).map(mapRecord);
}

// CREATE template
export async function createTemplate(t: Omit<NocoDBTemplate, 'id' | 'isSystem' | 'isActive'>): Promise<NocoDBTemplate> {
  const payload = {
    Title: t.name,
    category: t.category || null,
    subcategory: t.subcategory || null,
    base_prompt: t.basePrompt || null,
    style: t.style || null,
    background: t.background || null,
    lighting: t.lighting || null,
    is_system: false,
    is_active: true,
    created_by: 'user',
  };
  
  console.log('Creating template with payload:', JSON.stringify(payload, null, 2));
  console.log('Request URL:', `${BASE_URL}/api/v2/tables/${TABLE_ID}/records`);
  
  const res = await fetch(`${BASE_URL}/api/v2/tables/${TABLE_ID}/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  
  console.log('Create response status:', res.status);
  const responseText = await res.text();
  console.log('Create response body:', responseText);
  
  if (!res.ok) {
    console.error('Create failed with status', res.status, responseText);
    throw new Error(`Failed to create template: ${res.status} ${responseText}`);
  }
  
  return mapRecord(JSON.parse(responseText));
}

// UPDATE template
export async function updateTemplate(id: number, t: Partial<Omit<NocoDBTemplate, 'id'>>): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v2/tables/${TABLE_ID}/records`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      Id: id,
      ...(t.name !== undefined && { Title: t.name }),
      ...(t.category !== undefined && { category: t.category }),
      ...(t.subcategory !== undefined && { subcategory: t.subcategory }),
      ...(t.basePrompt !== undefined && { base_prompt: t.basePrompt }),
      ...(t.style !== undefined && { style: t.style }),
      ...(t.background !== undefined && { background: t.background }),
      ...(t.lighting !== undefined && { lighting: t.lighting }),
    }),
  });
  if (!res.ok) throw new Error('Failed to update template');
}

// DELETE template
export async function deleteTemplate(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v2/tables/${TABLE_ID}/records`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ Id: id }),
  });
  if (!res.ok) throw new Error('Failed to delete template');
}
