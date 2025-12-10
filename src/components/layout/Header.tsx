import { Link, useLocation } from "react-router-dom";
import { Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  usageCount?: number;
}

export function Header({ usageCount = 0 }: HeaderProps) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/templates", label: "Templates" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Image Optimizer Pro
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{usageCount}</span> images this month
            </span>
          </div>
          <Link to="/api-config">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings2 className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
