import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Settings as SettingsType, Template, UsageStats } from "@/types";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, templatesData, usageData] = await Promise.all([
          api.getSettings(),
          api.getTemplates(),
          api.getUsageStats(),
        ]);
        setSettings(settingsData);
        setTemplates(templatesData.templates);
        setUsage(usageData);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

      <main className="container px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Default Settings */}
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold mb-6">Default Settings</h2>

            <div className="space-y-6">
              {/* Default Resolution */}
              <div className="space-y-3">
                <Label>Default Resolution</Label>
                <RadioGroup
                  value={settings?.defaultResolution || '4K'}
                  onValueChange={(value) => setSettings(prev => prev ? { ...prev, defaultResolution: value as '2K' | '4K' } : null)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2K" id="res-2k" />
                    <Label htmlFor="res-2k" className="font-normal cursor-pointer">
                      2K (${settings?.cost2K?.toFixed(2) || '0.12'}/image)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4K" id="res-4k" />
                    <Label htmlFor="res-4k" className="font-normal cursor-pointer">
                      4K (${settings?.cost4K?.toFixed(2) || '0.24'}/image)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Default Trial Count */}
              <div className="space-y-2">
                <Label htmlFor="trialCount">Default Trial Count</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="trialCount"
                    type="number"
                    min={1}
                    max={20}
                    value={settings?.defaultTrialCount || 5}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, defaultTrialCount: parseInt(e.target.value) || 5 } : null)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">images</span>
                </div>
              </div>

              {/* Default Template */}
              <div className="space-y-2">
                <Label>Default Template</Label>
                <Select
                  value={settings?.defaultTemplateId?.toString() || ''}
                  onValueChange={(value) => setSettings(prev => prev ? { ...prev, defaultTemplateId: value ? parseInt(value) : null } : null)}
                >
                  <SelectTrigger className="w-full">
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
              </div>
            </div>
          </Card>

          {/* Usage Stats */}
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold mb-6">Usage This Month</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Images Processed</span>
                <span className="font-semibold">{usage?.imagesProcessed ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-semibold">${(usage?.totalCost ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Average Time</span>
                <span className="font-semibold">{usage?.avgTime ?? 0}s per image</span>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
