import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AIInsightsProps {
  transactions: any[];
  totalIncome: number;
  totalExpense: number;
}

const AIInsights = ({ transactions, totalIncome, totalExpense }: AIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Generate basic insights based on transaction data
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
      const categorySpending = transactions
        .filter(t => t.type === "expense")
        .reduce((acc: any, t) => {
          acc[t.category_name] = (acc[t.category_name] || 0) + parseFloat(t.amount);
          return acc;
        }, {});
      
      const topCategory = Object.entries(categorySpending)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      let insightText = `📊 **Financial Overview**\n\n`;
      
      if (savingsRate > 20) {
        insightText += `🎉 Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent financial discipline!\n\n`;
      } else if (savingsRate > 0) {
        insightText += `💡 You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing this to 20% or more for better financial health.\n\n`;
      } else {
        insightText += `⚠️ Your expenses exceed your income. Focus on reducing spending or increasing income sources.\n\n`;
      }
      
      if (topCategory) {
        insightText += `📈 Your highest spending category is **${topCategory[0]}** at ₹${(topCategory[1] as number).toFixed(2)}.\n\n`;
      }
      
      insightText += `💰 **Quick Tips:**\n`;
      insightText += `• Track daily expenses to identify spending patterns\n`;
      insightText += `• Set monthly budgets for each category\n`;
      insightText += `• Review and optimize recurring subscriptions\n`;
      insightText += `• Build an emergency fund covering 3-6 months of expenses`;
      
      setInsights(insightText);
      toast.success("Insights generated successfully!");
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card-glow">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg glow-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!insights && !isLoading && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Get personalized spending insights powered by AI
              </p>
              <Button
                onClick={generateInsights}
                className="gradient-bg glow-primary"
                disabled={transactions.length === 0}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your spending patterns...</p>
            </div>
          )}

          {insights && !isLoading && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{insights}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateInsights}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIInsights;
