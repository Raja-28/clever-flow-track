import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";

interface FinancialHealthScoreProps {
  totalIncome: number;
  totalExpense: number;
  transactions: any[];
}

const FinancialHealthScore = ({ totalIncome, totalExpense, transactions }: FinancialHealthScoreProps) => {
  // Calculate various financial health metrics
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;
  const transactionFrequency = transactions.length;
  
  // Calculate diversity of spending categories
  const uniqueCategories = new Set(transactions.filter(t => t.type === "expense").map(t => t.category_name)).size;
  const categoryDiversity = Math.min((uniqueCategories / 8) * 100, 100); // Assume 8 is ideal number of categories
  
  // Calculate consistency (transactions per month)
  const monthsWithTransactions = new Set(
    transactions.map(t => new Date(t.transaction_date).toISOString().slice(0, 7))
  ).size;
  const consistency = monthsWithTransactions > 0 ? Math.min((transactionFrequency / monthsWithTransactions / 10) * 100, 100) : 0;

  // Calculate overall health score
  const healthMetrics = [
    { name: "Savings Rate", score: Math.max(0, Math.min(savingsRate * 2, 100)), weight: 0.3 },
    { name: "Expense Control", score: Math.max(0, 100 - expenseRatio), weight: 0.25 },
    { name: "Tracking Consistency", score: consistency, weight: 0.25 },
    { name: "Category Diversity", score: categoryDiversity, weight: 0.2 }
  ];

  const overallScore = healthMetrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success/20 to-success/5";
    if (score >= 60) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: "Excellent", icon: Heart, color: "text-success" };
    if (score >= 60) return { status: "Good", icon: TrendingUp, color: "text-warning" };
    return { status: "Needs Attention", icon: Shield, color: "text-destructive" };
  };

  const healthStatus = getHealthStatus(overallScore);

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`bg-gradient-to-br ${getScoreGradient(overallScore)} p-2 rounded-lg border border-border/50`}>
            <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
          </div>
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 flex-1 flex flex-col">
        {/* Overall Score */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getScoreGradient(overallScore)} border-4 border-border/20 flex items-center justify-center`}
          >
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}
            </span>
          </motion.div>
          <div>
            <h3 className={`text-lg font-semibold ${healthStatus.color}`}>
              {healthStatus.status}
            </h3>
            <p className="text-sm text-muted-foreground">
              Overall Financial Health
            </p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4">
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{metric.name}</span>
                <span className={`font-bold ${getScoreColor(metric.score)}`}>
                  {Math.round(metric.score)}%
                </span>
              </div>
              <Progress 
                value={metric.score} 
                className="h-2"
              />
            </motion.div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Improvement Tips
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            {overallScore < 60 && (
              <p>• Focus on increasing your savings rate to at least 20%</p>
            )}
            {expenseRatio > 80 && (
              <p>• Consider reducing expenses or increasing income sources</p>
            )}
            {consistency < 50 && (
              <p>• Track transactions more consistently for better insights</p>
            )}
            {categoryDiversity < 50 && (
              <p>• Diversify your expense tracking across more categories</p>
            )}
            {overallScore >= 80 && (
              <p>• Excellent financial health! Keep up the great work!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScore;
