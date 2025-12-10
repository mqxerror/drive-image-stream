import { Clock, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/services/api";

interface StatsCardsProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Processed",
      value: stats?.totalProcessed ?? 0,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "In Queue",
      value: stats?.totalPending ?? 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Failed",
      value: stats?.totalFailed ?? 0,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total Cost",
      value: `$${(stats?.totalCost ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`relative overflow-hidden border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:shadow-lg ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {card.value}
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
