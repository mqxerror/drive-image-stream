import { Sparkles, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefresh: () => void;
  onTrigger: () => void;
  isRefreshing?: boolean;
  isTriggering?: boolean;
}

export function Header({ onRefresh, onTrigger, isRefreshing, isTriggering }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Image Optimizer
            </h1>
            <p className="text-xs text-muted-foreground">
              Google Drive → AI Enhanced
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="glow"
            onClick={onTrigger}
            disabled={isTriggering}
            className="gap-2"
          >
            {isTriggering ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Optimizer
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
