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
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { 
          transactions: transactions.map(t => ({
            type: t.type,
            category: t.category_name,
            amount: t.amount,
            date: t.transaction_date
          })),
          totalIncome,
          totalExpense
        }
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
      } else {
        throw new Error("No insights received");
      }
    } catch (error: any) {
      console.error("Error generating insights:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit reached. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error("Failed to generate insights. Please try again.");
      }
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
