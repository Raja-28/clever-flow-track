import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetAlertProps {
  budget: number;
  spent: number;
  forecast?: number;
}

const BudgetAlert = ({ budget, spent, forecast }: BudgetAlertProps) => {
  const percentage = (spent / budget) * 100;
  const forecastPercentage = forecast ? (forecast / budget) * 100 : 0;

  if (percentage < 80 && forecastPercentage < 90) {
    return null;
  }

  const isOverBudget = percentage >= 100;
  const isNearBudget = percentage >= 80 && percentage < 100;
  const isForecastOver = forecastPercentage >= 90;

  return (
    <div className="space-y-3">
      {(isOverBudget || isNearBudget) && (
        <Alert variant={isOverBudget ? "destructive" : "default"} className={cn(
          !isOverBudget && "border-warning bg-warning/5"
        )}>
          <AlertTriangle className={cn(
            "h-4 w-4",
            !isOverBudget && "text-warning"
          )} />
          <AlertTitle className={cn(!isOverBudget && "text-warning")}>
            {isOverBudget ? "Budget Exceeded!" : "Approaching Budget Limit"}
          </AlertTitle>
          <AlertDescription className={cn(!isOverBudget && "text-warning/90")}>
            You've spent ₹{spent.toFixed(2)} ({percentage.toFixed(1)}%) of your ₹{budget.toFixed(2)} monthly budget.
            {isOverBudget 
              ? " Consider reviewing your expenses."
              : " Monitor your spending closely."}
          </AlertDescription>
        </Alert>
      )}

      {forecast && isForecastOver && !isOverBudget && (
        <Alert className="border-primary bg-primary/5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Forecast Alert</AlertTitle>
          <AlertDescription className="text-primary/90">
            Based on your spending pattern, you're projected to spend ₹{forecast.toFixed(2)} this month 
            ({forecastPercentage.toFixed(1)}% of budget). Consider adjusting your expenses.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BudgetAlert;
