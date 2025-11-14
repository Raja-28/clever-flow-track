import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

interface SmartGoalsProps {
  userId: string;
}

const SmartGoals = ({ userId }: SmartGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    // For now, use localStorage until goals table is created
    const storedGoals = localStorage.getItem(`goals_${userId}`);
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  };

  const handleAddGoal = async () => {
    if (!title || !targetAmount || !deadline) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        user_id: userId,
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        deadline,
        created_at: new Date().toISOString(),
      };

      const storedGoals = localStorage.getItem(`goals_${userId}`);
      const existingGoals = storedGoals ? JSON.parse(storedGoals) : [];
      const updatedGoals = [newGoal, ...existingGoals];
      
      localStorage.setItem(`goals_${userId}`, JSON.stringify(updatedGoals));
      
      toast.success("Goal added successfully!");
      fetchGoals();
      setIsOpen(false);
      setTitle("");
      setTargetAmount("");
      setDeadline("");
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const storedGoals = localStorage.getItem(`goals_${userId}`);
      if (storedGoals) {
        const existingGoals = JSON.parse(storedGoals);
        const updatedGoals = existingGoals.filter((goal: Goal) => goal.id !== goalId);
        localStorage.setItem(`goals_${userId}`, JSON.stringify(updatedGoals));
        
        toast.success("Goal deleted");
        fetchGoals();
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-accent to-success p-2 rounded-lg glow-accent">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
            Smart Goals
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-bg">
                <Plus className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Save for vacation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Target Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full gradient-bg">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No goals yet. Create one to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartGoals;
