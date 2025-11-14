import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, TrendingDown, Zap, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, isToday, isYesterday } from "date-fns";

interface QuickStatsProps {
  transactions: any[];
  totalIncome: number;
  totalExpense: number;
}

const QuickStats = ({ transactions, totalIncome, totalExpense }: QuickStatsProps) => {
  // Calculate today's transactions
  const todayTransactions = transactions.filter(t => 
    isToday(new Date(t.transaction_date))
  );
  
  // Calculate yesterday's transactions
  const yesterdayTransactions = transactions.filter(t => 
    isYesterday(new Date(t.transaction_date))
  );

  // Calculate this month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  // Calculate averages
  const avgTransactionAmount = transactions.length > 0 
    ? transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length 
    : 0;

  const avgDailyExpense = thisMonthTransactions.length > 0
    ? thisMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) / new Date().getDate()
    : 0;

  // Find largest transaction
  const largestTransaction = transactions.reduce((max, t) => 
    parseFloat(t.amount) > parseFloat(max.amount || 0) ? t : max, 
    { amount: 0, category_name: "", type: "" }
  );

  // Calculate transaction frequency
  const transactionDays = new Set(
    transactions.map(t => format(new Date(t.transaction_date), 'yyyy-MM-dd'))
  ).size;

  const stats = [
    {
      label: "Today",
      value: todayTransactions.length,
      subValue: `₹${todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(0)}`,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Yesterday",
      value: yesterdayTransactions.length,
      subValue: `₹${yesterdayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(0)}`,
      icon: Clock,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      label: "Avg Transaction",
      value: `₹${avgTransactionAmount.toFixed(0)}`,
      subValue: `${transactions.length} total`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      label: "Daily Avg Expense",
      value: `₹${avgDailyExpense.toFixed(0)}`,
      subValue: "This month",
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      label: "Largest Transaction",
      value: `₹${parseFloat(largestTransaction.amount || 0).toFixed(0)}`,
      subValue: largestTransaction.category_name || "N/A",
      icon: Zap,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      label: "Active Days",
      value: transactionDays,
      subValue: "Days with transactions",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-all hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {index < 2 && (
                    <Badge variant="outline" className="text-xs">
                      Recent
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.subValue}
                  </p>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-sm font-bold text-foreground">
                {thisMonthTransactions.length} transactions
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Net Flow</p>
              <p className={`text-sm font-bold ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{(totalIncome - totalExpense).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
