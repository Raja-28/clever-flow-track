import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Flame, TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface GamificationProps {
  transactions: any[];
  totalIncome: number;
  totalExpense: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  achieved: boolean;
  progress: number;
}

const Gamification = ({ transactions, totalIncome, totalExpense }: GamificationProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    calculateBadges();
    calculateStreak();
    calculateLevel();
  }, [transactions, totalIncome, totalExpense]);

  const calculateBadges = () => {
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const transactionCount = transactions.length;

    const newBadges: Badge[] = [
      {
        id: "first-transaction",
        name: "Getting Started",
        description: "Add your first transaction",
        icon: Zap,
        achieved: transactionCount >= 1,
        progress: Math.min((transactionCount / 1) * 100, 100),
      },
      {
        id: "budget-keeper",
        name: "Budget Keeper",
        description: "Stay under budget for 3 days",
        icon: Target,
        achieved: streak >= 3,
        progress: Math.min((streak / 3) * 100, 100),
      },
      {
        id: "super-saver",
        name: "Super Saver",
        description: "Save more than 30% of income",
        icon: TrendingUp,
        achieved: savingsRate >= 30,
        progress: Math.min((savingsRate / 30) * 100, 100),
      },
      {
        id: "tracking-pro",
        name: "Tracking Pro",
        description: "Record 50 transactions",
        icon: Award,
        achieved: transactionCount >= 50,
        progress: Math.min((transactionCount / 50) * 100, 100),
      },
    ];

    setBadges(newBadges);
  };

  const calculateStreak = () => {
    // Simple streak calculation - could be enhanced with actual daily tracking
    const daysSinceFirstTransaction = transactions.length > 0 ? 
      Math.floor((Date.now() - new Date(transactions[transactions.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    setStreak(Math.min(daysSinceFirstTransaction, 10));
  };

  const calculateLevel = () => {
    const points = transactions.length * 10 + Math.floor(totalIncome / 1000);
    const newLevel = Math.floor(points / 100) + 1;
    setLevel(Math.min(newLevel, 10));
  };

  const levelProgress = ((transactions.length * 10 + Math.floor(totalIncome / 1000)) % 100);

  return (
    <Card className="glass-card">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="bg-gradient-to-br from-warning to-destructive p-2 rounded-lg">
            <Award className="h-5 w-5 text-warning-foreground" />
          </div>
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-xs text-muted-foreground">Next: Level {level + 1}</span>
          </div>
          <Progress value={levelProgress} className="h-3" />
        </div>

        {/* Streak */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-warning/20 to-destructive/20 border border-warning/30"
        >
          <Flame className="h-8 w-8 text-warning" />
          <div>
            <p className="text-2xl font-bold text-foreground">{streak} Days</p>
            <p className="text-sm text-muted-foreground">Current Streak 🔥</p>
          </div>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all ${
                badge.achieved
                  ? "bg-primary/10 border-primary glow-primary"
                  : "bg-muted/30 border-border/50"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full ${
                  badge.achieved ? "bg-primary/20" : "bg-muted/50"
                }`}>
                  <badge.icon className={`h-6 w-6 ${
                    badge.achieved ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${
                    badge.achieved ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                </div>
                {!badge.achieved && (
                  <div className="w-full">
                    <Progress value={badge.progress} className="h-1" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Gamification;
