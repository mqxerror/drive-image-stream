import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { api, Settings as SettingsType } from "@/services/api";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Error",
        description: "Failed to save settings",
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">
              Configure optimizer settings
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8">
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="inputFolderId">Input Folder ID</Label>
            <Input
              id="inputFolderId"
              value={settings?.inputFolderId ?? ""}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, inputFolderId: e.target.value } : null
                )
              }
              placeholder="Google Drive folder ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outputFolderId">Output Folder ID</Label>
            <Input
              id="outputFolderId"
              value={settings?.outputFolderId ?? ""}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, outputFolderId: e.target.value } : null
                )
              }
              placeholder="Google Drive folder ID"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost2K">Cost per 2K Image ($)</Label>
              <Input
                id="cost2K"
                type="number"
                step="0.01"
                min="0"
                value={settings?.cost2K ?? 0}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, cost2K: parseFloat(e.target.value) || 0 } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost4K">Cost per 4K Image ($)</Label>
              <Input
                id="cost4K"
                type="number"
                step="0.01"
                min="0"
                value={settings?.cost4K ?? 0}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, cost4K: parseFloat(e.target.value) || 0 } : null
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultResolution">Default Resolution</Label>
            <Select
              value={settings?.defaultResolution ?? "2K"}
              onValueChange={(value: "2K" | "4K") =>
                setSettings((prev) =>
                  prev ? { ...prev, defaultResolution: value } : null
                )
              }
            >
              <SelectTrigger id="defaultResolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2K">2K (2048px)</SelectItem>
                <SelectItem value="4K">4K (4096px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
