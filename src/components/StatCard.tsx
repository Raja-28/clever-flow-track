import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "blue" | "green" | "red";
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: StatCardProps) => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  const prefix = typeof value === 'string' && value.includes('₹') ? '₹' : '';
  
  const colorMap = {
    blue: "from-primary to-primary-glow",
    green: "from-success to-accent",
    red: "from-destructive to-warning"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform"
    >
      <Card className="glass-card-glow overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-br ${colorMap[color]} p-2 rounded-lg glow-primary`}
            >
              <Icon className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold tracking-tight">
              {prefix}
              <CountUp
                end={numericValue || 0}
                duration={2}
                decimals={prefix ? 2 : 0}
                separator=","
              />
            </h3>
            {trend && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-sm flex items-center gap-1 ${
                  trend === "up" ? "text-success" : "text-destructive"
                }`}
              >
                {trendValue}
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
