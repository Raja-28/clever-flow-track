import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BudgetCategory {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
}

interface BudgetPlannerProps {
  userId: string;
  transactions: any[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BudgetPlanner = ({ userId, transactions, isOpen, onOpenChange }: BudgetPlannerProps) => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, [userId]);

  useEffect(() => {
    updateSpentAmounts();
  }, [transactions, budgets]);

  const fetchBudgets = () => {
    const storedBudgets = localStorage.getItem(`budgets_${userId}`);
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  };

  const updateSpentAmounts = () => {
    const categorySpending = transactions
      .filter(t => t.type === "expense")
      .reduce((acc: any, t) => {
        const currentMonth = new Date().getMonth();
        const transactionMonth = new Date(t.transaction_date).getMonth();
        
        // Only count current month expenses
        if (currentMonth === transactionMonth) {
          acc[t.category_name] = (acc[t.category_name] || 0) + parseFloat(t.amount);
        }
        return acc;
      }, {});

    setBudgets(prevBudgets => 
      prevBudgets.map(budget => ({
        ...budget,
        spentAmount: categorySpending[budget.category] || 0
      }))
    );
  };

  const handleAddBudget = () => {
    if (!category || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast.error("Please enter valid category and budget amount");
      return;
    }

    const newBudget: BudgetCategory = {
      id: Date.now().toString(),
      category,
      budgetAmount: parseFloat(budgetAmount),
      spentAmount: 0
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(updatedBudgets));
    
    setCategory("");
    setBudgetAmount("");
    toast.success("Budget added successfully!");
  };

  const handleEditBudget = (budget: BudgetCategory) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setBudgetAmount(budget.budgetAmount.toString());
  };

  const handleUpdateBudget = () => {
    if (!editingBudget || !category || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      toast.error("Please enter valid category and budget amount");
      return;
    }

    const updatedBudgets = budgets.map(budget =>
      budget.id === editingBudget.id
        ? { ...budget, category, budgetAmount: parseFloat(budgetAmount) }
        : budget
    );

    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(updatedBudgets));
    
    setEditingBudget(null);
    setCategory("");
    setBudgetAmount("");
    toast.success("Budget updated successfully!");
  };

  const handleDeleteBudget = (budgetId: string) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${userId}`, JSON.stringify(updatedBudgets));
    toast.success("Budget deleted successfully!");
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Budget Planner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Budget Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Budget</span>
                  <span className="font-bold text-lg">₹{totalBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                  <span className={`font-bold text-lg ${totalSpent > totalBudget ? 'text-destructive' : 'text-foreground'}`}>
                    ₹{totalSpent.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(overallProgress, 100)} 
                  className={`h-3 ${overallProgress > 100 ? 'bg-destructive/20' : ''}`}
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={overallProgress > 100 ? 'text-destructive font-bold' : 'text-foreground'}>
                    {overallProgress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Budget Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food, Transport"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget Amount (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  {editingBudget ? (
                    <div className="flex gap-2 w-full">
                      <Button onClick={handleUpdateBudget} className="flex-1">
                        Update Budget
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingBudget(null);
                          setCategory("");
                          setBudgetAmount("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleAddBudget} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Budget
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Category Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No budgets set yet. Add your first budget above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget, index) => {
                    const progress = budget.budgetAmount > 0 ? (budget.spentAmount / budget.budgetAmount) * 100 : 0;
                    const isOverBudget = progress > 100;
                    
                    return (
                      <motion.div
                        key={budget.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{budget.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              ₹{budget.spentAmount.toFixed(2)} / ₹{budget.budgetAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(progress, 100)} 
                            className={`h-2 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                          />
                          {isOverBudget && (
                            <p className="text-xs text-destructive font-medium">
                              Over budget by ₹{(budget.spentAmount - budget.budgetAmount).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetPlanner;
