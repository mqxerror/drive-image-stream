import { Folder, Image, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/types";

interface StatsCardsProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Projects",
      value: stats?.projectCount ?? 0,
      icon: Folder,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Processed",
      value: stats?.processedThisMonth ?? 0,
      suffix: "this month",
      icon: Image,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Cost",
      value: `$${(stats?.totalCostThisMonth ?? 0).toFixed(2)}`,
      suffix: "this month",
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Avg Time",
      value: `${stats?.avgTimeSeconds ?? 0}s`,
      suffix: "per image",
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
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
              {card.suffix && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.suffix}
                </p>
              )}
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
