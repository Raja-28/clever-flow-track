import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, DollarSign, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface QuickExpense {
  id: string;
  amount: number;
  category: string;
  timestamp: Date;
}

interface ExpenseTrackerProps {
  onAddExpense?: (expense: { amount: number; category: string }) => void;
}

const ExpenseTracker = ({ onAddExpense }: ExpenseTrackerProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [quickExpenses, setQuickExpenses] = useState<QuickExpense[]>([]);

  const quickCategories = [
    { name: "Food", emoji: "🍕", color: "bg-orange-100 text-orange-800" },
    { name: "Transport", emoji: "🚗", color: "bg-blue-100 text-blue-800" },
    { name: "Shopping", emoji: "🛒", color: "bg-purple-100 text-purple-800" },
    { name: "Bills", emoji: "📄", color: "bg-red-100 text-red-800" },
    { name: "Entertainment", emoji: "🎬", color: "bg-green-100 text-green-800" },
    { name: "Other", emoji: "💰", color: "bg-gray-100 text-gray-800" }
  ];

  const handleQuickAdd = (categoryName: string) => {
    if (!amount || parseFloat(amount) <= 0) return;

    const newExpense: QuickExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category: categoryName,
      timestamp: new Date()
    };

    setQuickExpenses(prev => [newExpense, ...prev.slice(0, 4)]); // Keep only last 5
    
    // Call parent callback if provided
    if (onAddExpense) {
      onAddExpense({ amount: parseFloat(amount), category: categoryName });
    }

    setAmount("");
    setCategory("");
  };

  const handleManualAdd = () => {
    if (!amount || !category || parseFloat(amount) <= 0) return;
    handleQuickAdd(category);
  };

  const removeExpense = (id: string) => {
    setQuickExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const totalQuickExpenses = quickExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Card className="glass-card">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="bg-gradient-to-br from-destructive/20 to-warning/20 p-2 rounded-lg">
            <DollarSign className="h-5 w-5 text-destructive" />
          </div>
          Quick Expense Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Amount (₹)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        {/* Quick Category Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Categories</label>
          <div className="grid grid-cols-2 gap-2">
            {quickCategories.map((cat) => (
              <Button
                key={cat.name}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(cat.name)}
                disabled={!amount || parseFloat(amount) <= 0}
                className="h-10 justify-start gap-2 hover:scale-105 transition-transform"
              >
                <span className="text-sm">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Manual Category Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom Category</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter category..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleManualAdd}
              disabled={!amount || !category || parseFloat(amount) <= 0}
              size="sm"
              className="px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Recent Quick Expenses */}
        {quickExpenses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Recent Quick Adds</label>
              <Badge variant="secondary" className="text-xs">
                ₹{totalQuickExpenses.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <AnimatePresence>
                {quickExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {expense.category}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(expense.timestamp, "HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-destructive">
                        ₹{expense.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpense(expense.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Quick Adds</p>
              <p className="text-sm font-bold text-foreground">
                {quickExpenses.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-sm font-bold text-destructive">
                ₹{totalQuickExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTracker;
