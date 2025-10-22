import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";
import { motion } from "framer-motion";

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

  // Extract numeric value for CountUp
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
  const prefix = value.match(/[^0-9.-]+/)?.[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn(
        "glass-card shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elevated)]",
        variants[variant]
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">
                {prefix}
                <CountUp
                  end={numericValue}
                  duration={2}
                  decimals={2}
                  separator=","
                  preserveValue
                />
              </p>
              {trend && (
                <p className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-accent" : "text-destructive"
                )}>
                  {trend.value}
                </p>
              )}
            </div>
            <motion.div
              className={cn(
                "p-3 rounded-lg",
                variant === "income" && "bg-accent/10",
                variant === "expense" && "bg-destructive/10",
                variant === "balance" && "bg-primary/10",
                variant === "default" && "bg-muted"
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className={cn(
                "h-6 w-6",
                variant === "income" && "text-accent",
                variant === "expense" && "text-destructive",
                variant === "balance" && "text-primary",
                variant === "default" && "text-muted-foreground"
              )} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
