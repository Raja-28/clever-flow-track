import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, CheckCircle2, Sparkles, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetAlertProps {
  budget: number;
  spent: number;
  forecast?: number;
}

const BudgetAlert = ({ budget, spent, forecast }: BudgetAlertProps) => {
  const percentage = (spent / budget) * 100;
  const forecastPercentage = forecast ? (forecast / budget) * 100 : 0;
  const remaining = budget - spent;
  const remainingPercentage = ((budget - spent) / budget) * 100;

  const isOverBudget = percentage >= 100;
  const isNearBudget = percentage >= 80 && percentage < 100;
  const isWarning = percentage >= 60 && percentage < 80;
  const isGood = percentage < 60;
  const isForecastOver = forecastPercentage >= 90;
  const isForecastWarning = forecastPercentage >= 80 && forecastPercentage < 90;

  return (
    <div className="space-y-3">
      {/* Over Budget Alert */}
      {isOverBudget && (
        <Alert 
          variant="destructive" 
          className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-2 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-red-900 text-lg font-bold mb-2">
                🚨 Budget Exceeded!
              </AlertTitle>
              <AlertDescription className="text-red-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">You've spent ₹{spent.toFixed(2)}</span>
                  <span className="px-2 py-1 bg-red-200 rounded-full text-xs font-bold text-red-900">
                    {percentage.toFixed(1)}% over
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000 relative"
                    style={{width: `${Math.min(percentage, 150)}%`}}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm mt-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  You're ₹{(spent - budget).toFixed(2)} over your ₹{budget.toFixed(2)} monthly budget.
                  <strong>Time to review and adjust!</strong>
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Near Budget Warning */}
      {isNearBudget && (
        <Alert 
          className="border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-orange-500 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-orange-900 text-lg font-bold mb-2 flex items-center gap-2">
                ⚠️ Approaching Budget Limit
                <span className="ml-auto text-sm font-normal px-2 py-1 bg-orange-200 rounded-full">
                  {remainingPercentage.toFixed(0)}% left
                </span>
              </AlertTitle>
              <AlertDescription className="text-orange-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Spent: <strong>₹{spent.toFixed(2)}</strong></span>
                  <span>Budget: ₹{budget.toFixed(2)}</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <strong>₹{remaining.toFixed(2)}</strong> remaining
                  </span>
                  <span className="text-xs text-orange-700">Monitor spending closely</span>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Warning Level */}
      {isWarning && !isNearBudget && (
        <Alert 
          className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-yellow-500 rounded-full p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-yellow-900 text-base font-bold mb-2">
                Budget Status Check
              </AlertTitle>
              <AlertDescription className="text-yellow-800 space-y-2">
                <div className="w-full bg-yellow-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span><strong>{percentage.toFixed(0)}%</strong> of budget used</span>
                  <span className="text-yellow-700">₹{remaining.toFixed(2)} left</span>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Good Status */}
      {isGood && percentage > 0 && (
        <Alert 
          className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-green-900 text-base font-bold mb-2 flex items-center gap-2">
                ✨ Great Progress!
                <span className="ml-auto text-sm font-normal px-2 py-1 bg-green-200 rounded-full">
                  {percentage.toFixed(0)}% used
                </span>
              </AlertTitle>
              <AlertDescription className="text-green-800 space-y-2">
                <div className="w-full bg-green-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{width: `${percentage}%`}}
                  ></div>
                </div>
                <p className="text-sm">
                  You're on track! <strong>₹{remaining.toFixed(2)}</strong> ({remainingPercentage.toFixed(0)}%) remaining in your budget.
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Forecast Alert - Critical */}
      {forecast && isForecastOver && !isOverBudget && (
        <Alert 
          className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 shadow-lg animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 rounded-full p-2 animate-bounce">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-purple-900 text-lg font-bold mb-2 flex items-center gap-2">
                🔮 Forecast Alert
                <span className="ml-auto text-sm font-normal px-2 py-1 bg-purple-200 rounded-full">
                  {forecastPercentage.toFixed(0)}% projected
                </span>
              </AlertTitle>
              <AlertDescription className="text-purple-800 space-y-2">
                <div className="bg-purple-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current: <strong>₹{spent.toFixed(2)}</strong></span>
                    <span>Projected: <strong>₹{forecast.toFixed(2)}</strong></span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
                    <div className="flex h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-l-full transition-all duration-1000"
                        style={{width: `${(percentage / forecastPercentage) * 100}%`}}
                      ></div>
                      <div 
                        className="bg-purple-300 rounded-r-full transition-all duration-1000"
                        style={{width: `${((forecastPercentage - percentage) / forecastPercentage) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium pt-1">
                  📊 Based on your spending pattern, you may exceed your budget by ₹{(forecast - budget).toFixed(2)}. 
                  Consider adjusting expenses now!
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Forecast Warning */}
      {forecast && isForecastWarning && !isForecastOver && !isNearBudget && (
        <Alert 
          className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md animate-in slide-in-from-top duration-500"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertTitle className="text-blue-900 text-base font-bold mb-2">
                📈 Spending Forecast
              </AlertTitle>
              <AlertDescription className="text-blue-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Projected spending: <strong>₹{forecast.toFixed(2)}</strong></span>
                  <span className="text-xs text-blue-700">{forecastPercentage.toFixed(0)}% of budget</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{width: `${forecastPercentage}%`}}
                  ></div>
                </div>
                <p className="text-sm">Stay mindful of your spending to remain within budget.</p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default BudgetAlert;