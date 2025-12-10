import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useApiConfig, defaultApiConfig, ApiConfig } from '@/hooks/useApiConfig';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, RotateCcw, Save, Settings2 } from 'lucide-react';

type EndpointName = keyof ApiConfig['endpoints'];

interface EndpointStatus {
  [key: string]: 'idle' | 'testing' | 'success' | 'error';
}

const endpointMethods: Record<EndpointName, string> = {
  stats: 'GET',
  projects: 'GET, POST',
  projectUpdate: 'PUT',
  templates: 'GET, POST',
  trial: 'POST',
  queue: 'GET',
  history: 'GET',
  trigger: 'POST',
  redo: 'POST',
  settings: 'GET, PUT',
};

const getTestConfig = (name: EndpointName): { method: string; body?: object } => {
  switch (name) {
    case 'trial':
      return { method: 'POST', body: { projectId: 1 } };
    case 'projectUpdate':
      return { method: 'PUT', body: { projectId: 1, name: 'Test' } };
    case 'trigger':
      return { method: 'POST', body: {} };
    case 'redo':
      return { method: 'POST', body: { fileId: 'test' } };
    case 'settings':
      return { method: 'PUT', body: { key: 'resolution', value: '2K' } };
    case 'templates':
    case 'projects':
      return { method: 'GET' }; // Use GET for testing these
    default:
      return { method: 'GET' };
  }
};

export default function ApiConfigPage() {
  const { config, updateConfig, resetToDefaults } = useApiConfig();
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);
  const [statuses, setStatuses] = useState<EndpointStatus>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleBaseUrlChange = (value: string) => {
    setLocalConfig(prev => ({ ...prev, baseUrl: value }));
    setHasChanges(true);
  };

  const handleEndpointChange = (name: EndpointName, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      endpoints: { ...prev.endpoints, [name]: value },
    }));
    setHasChanges(true);
  };

  const testEndpoint = async (name: EndpointName) => {
    setStatuses(prev => ({ ...prev, [name]: 'testing' }));
    
    const url = `${localConfig.baseUrl}${localConfig.endpoints[name]}`;
    const testConfig = getTestConfig(name);
    
    try {
      const response = await fetch(url, {
        method: testConfig.method,
        headers: { 'Content-Type': 'application/json' },
        ...(testConfig.body ? { body: JSON.stringify(testConfig.body) } : {}),
      });
      
      // Check if response is OK or has success in JSON
      if (response.ok) {
        setStatuses(prev => ({ ...prev, [name]: 'success' }));
        toast.success(`${name} endpoint is reachable`);
      } else {
        // Try to parse JSON for success field
        try {
          const data = await response.json();
          if (data.success) {
            setStatuses(prev => ({ ...prev, [name]: 'success' }));
            toast.success(`${name} endpoint is reachable`);
          } else {
            setStatuses(prev => ({ ...prev, [name]: 'error' }));
            toast.error(`${name} endpoint returned ${response.status}`);
          }
        } catch {
          setStatuses(prev => ({ ...prev, [name]: 'error' }));
          toast.error(`${name} endpoint returned ${response.status}`);
        }
      }
    } catch {
      setStatuses(prev => ({ ...prev, [name]: 'error' }));
      toast.error(`Failed to reach ${name} endpoint`);
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = Object.keys(localConfig.endpoints) as EndpointName[];
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
    }
  };

  const handleSave = () => {
    updateConfig(localConfig);
    setHasChanges(false);
    toast.success('API configuration saved');
  };

  const handleReset = () => {
    setLocalConfig(defaultApiConfig);
    resetToDefaults();
    setHasChanges(false);
    setStatuses({});
    toast.success('Reset to default configuration');
  };

  const getStatusIcon = (name: string) => {
    const status = statuses[name];
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">API Configuration</h1>
          </div>
          <p className="text-muted-foreground">
            Configure the API endpoints used throughout the application
          </p>
        </div>

        <div className="space-y-6">
          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
              <CardDescription>
                The root URL for all API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={localConfig.baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="https://api.example.com"
                className="font-mono"
              />
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
              <CardDescription>
                Configure individual endpoint paths. These are appended to the base URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(localConfig.endpoints) as EndpointName[]).map((name) => (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <Label className="text-sm font-medium capitalize">{name}</Label>
                    <p className="text-xs text-muted-foreground">{endpointMethods[name]}</p>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={localConfig.endpoints[name]}
                      onChange={(e) => handleEndpointChange(name, e.target.value)}
                      placeholder="/endpoint"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="w-8 flex justify-center">
                    {getStatusIcon(name)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testEndpoint(name)}
                    disabled={statuses[name] === 'testing'}
                  >
                    Test
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button variant="outline" onClick={testAllEndpoints}>
                Test All Endpoints
              </Button>
            </div>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
