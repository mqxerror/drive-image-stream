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
import { getSettings, updateSettings, getTemplates, getStats } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Settings as SettingsType, Template, Stats } from "@/types";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, templatesData, statsData] = await Promise.all([
          getSettings(),
          getTemplates(),
          getStats(),
        ]);
        setSettings(settingsData);
        setTemplates(templatesData);
        setStats(statsData);
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
      await updateSettings(settings);
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
                  value={settings?.resolution || '2K'}
                  onValueChange={(value) => setSettings(prev => prev ? { ...prev, resolution: value } : null)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2K" id="res-2k" />
                    <Label htmlFor="res-2k" className="font-normal cursor-pointer">
                      2K (${settings?.costPerImage2k?.toFixed(2) || '0.12'}/image)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4K" id="res-4k" />
                    <Label htmlFor="res-4k" className="font-normal cursor-pointer">
                      4K (${settings?.costPerImage4k?.toFixed(2) || '0.24'}/image)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Batch Size */}
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="batchSize"
                    type="number"
                    min={1}
                    max={50}
                    value={settings?.batchSize || 1}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, batchSize: parseInt(e.target.value) || 1 } : null)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">images per batch</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label htmlFor="scheduleMinutes">Schedule Interval</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="scheduleMinutes"
                    type="number"
                    min={1}
                    max={60}
                    value={settings?.scheduleMinutes || 2}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, scheduleMinutes: parseInt(e.target.value) || 2 } : null)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutes between batches</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold mb-6">Current Stats</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">In Queue</span>
                <span className="font-semibold">{stats?.inQueue ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Processed Today</span>
                <span className="font-semibold">{stats?.processedToday ?? 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-semibold">${(stats?.totalCost ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Average Time</span>
                <span className="font-semibold">{stats?.avgTimeSeconds ?? 0}s per image</span>
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
