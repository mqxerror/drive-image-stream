import { Clock, DollarSign, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/services/api";

interface StatsCardsProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Processing",
      value: stats?.processingNow ?? 0,
      icon: Zap,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber/20",
      iconColor: "text-amber",
      pulse: true,
    },
    {
      title: "In Queue",
      value: stats?.totalPending ?? 0,
      icon: Clock,
      gradient: "from-info/20 to-info/5",
      iconBg: "bg-info/20",
      iconColor: "text-info",
    },
    {
      title: "Completed",
      value: stats?.totalProcessed ?? 0,
      icon: CheckCircle2,
      gradient: "from-success/20 to-success/5",
      iconBg: "bg-success/20",
      iconColor: "text-success",
    },
    {
      title: "Failed",
      value: stats?.totalFailed ?? 0,
      icon: AlertCircle,
      gradient: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      title: "Cost Today",
      value: `$${(stats?.costToday ?? 0).toFixed(2)}`,
      subValue: `All time: $${(stats?.totalCost ?? 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-purple/20 to-purple/5",
      iconBg: "bg-purple/20",
      iconColor: "text-purple",
    },
  ];

  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`relative overflow-hidden border-border/40 bg-gradient-to-br ${card.gradient} p-3 transition-all hover:border-border/60 hover:shadow-md ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                {card.title}
              </p>
              <p className="mt-0.5 text-xl font-bold tracking-tight">
                {card.value}
              </p>
              {card.subValue && (
                <p className="mt-0.5 text-[9px] text-muted-foreground">
                  {card.subValue}
                </p>
              )}
            </div>
            <div className={`rounded-md p-1.5 ${card.iconBg} relative shrink-0`}>
              {card.pulse && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
              )}
              <card.icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
