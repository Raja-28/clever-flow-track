import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense" | "balance";
}

const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variants = {
    default: "border-l-4 border-l-primary",
    income: "border-l-4 border-l-accent",
    expense: "border-l-4 border-l-destructive",
    balance: "border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent",
  };

  return (
    <Card className={cn("shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elevated)]", variants[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-accent" : "text-destructive"
              )}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            variant === "income" && "bg-accent/10",
            variant === "expense" && "bg-destructive/10",
            variant === "balance" && "bg-primary/10",
            variant === "default" && "bg-muted"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              variant === "income" && "text-accent",
              variant === "expense" && "text-destructive",
              variant === "balance" && "text-primary",
              variant === "default" && "text-muted-foreground"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
