import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Wrench } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <Card className="p-8 border-border/50 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Global settings and configuration options are being developed. 
            Check back soon for advanced features.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
