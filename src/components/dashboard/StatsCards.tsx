import { Clock, DollarSign, AlertCircle, CheckCircle2, Zap, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/services/api";

interface StatsCardsProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const row1Cards = [
    {
      title: "Processing Now",
      value: stats?.processingNow ?? 0,
      icon: Zap,
      gradient: "from-amber-500/20 to-amber-600/10",
      iconBg: "bg-amber/20",
      iconColor: "text-amber",
      pulse: true,
    },
    {
      title: "In Queue",
      value: stats?.totalPending ?? 0,
      icon: ListTodo,
      gradient: "from-info/20 to-info/10",
      iconBg: "bg-info/20",
      iconColor: "text-info",
    },
    {
      title: "Completed Today",
      value: stats?.completedToday ?? 0,
      icon: CheckCircle2,
      gradient: "from-success/20 to-success/10",
      iconBg: "bg-success/20",
      iconColor: "text-success",
    },
  ];

  const row2Cards = [
    {
      title: "Failed",
      value: stats?.totalFailed ?? 0,
      icon: AlertCircle,
      gradient: "from-destructive/20 to-destructive/10",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      title: "Total Processed",
      value: stats?.totalProcessed ?? 0,
      icon: CheckCircle2,
      gradient: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Cost Today",
      value: `$${(stats?.costToday ?? 0).toFixed(2)}`,
      subValue: `All time: $${(stats?.totalCost ?? 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-purple/20 to-purple/10",
      iconBg: "bg-purple/20",
      iconColor: "text-purple",
    },
  ];

  interface StatCardData {
    title: string;
    value: number | string;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    iconColor: string;
    pulse?: boolean;
    subValue?: string;
  }

  const StatCard = ({ card }: { card: StatCardData }) => (
    <Card
      className={`relative overflow-hidden border-border/40 bg-gradient-to-br ${card.gradient} p-4 transition-all hover:border-border/60 hover:shadow-md ${
        isLoading ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {card.title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {card.value}
          </p>
          {card.subValue && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {card.subValue}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2 ${card.iconBg} relative`}>
          {card.pulse && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber animate-pulse" />
          )}
          <card.icon className={`h-4 w-4 ${card.iconColor}`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-3">
      {/* Row 1 */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
        {row1Cards.map((card) => (
          <StatCard key={card.title} card={card} />
        ))}
      </div>
      {/* Row 2 */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
        {row2Cards.map((card) => (
          <StatCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
