import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, Target, PieChart, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import SpendingChart from "@/components/SpendingChart";
import TrendChart from "@/components/TrendChart";
import BudgetAlert from "@/components/BudgetAlert";
import AIInsights from "@/components/AIInsights";
import SmartGoals from "@/components/SmartGoals";
import Gamification from "@/components/Gamification";
import { ThemeToggle } from "@/components/ThemeToggle";
import BudgetPlanner from "@/components/BudgetPlanner";
import ReportsModal from "@/components/ReportsModal";
import FinancialHealthScore from "@/components/FinancialHealthScore";
import QuickStats from "@/components/QuickStats";
import ExpenseTracker from "@/components/ExpenseTracker";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetPlannerOpen, setIsBudgetPlannerOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setUser(session.user);
    await Promise.all([fetchProfile(session.user.id), fetchTransactions(session.user.id)]);
    setIsLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete transaction");
    } else {
      toast.success("Transaction deleted");
      fetchTransactions(user.id);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchTransactions(user.id);
    setEditTransaction(null);
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Create consistent color mapping for categories
  const getCategoryColor = (categoryName: string) => {
    const colors = [
      'hsl(210, 80%, 50%)', // Blue
      'hsl(170, 60%, 45%)', // Teal
      'hsl(280, 60%, 55%)', // Purple
      'hsl(38, 92%, 50%)',  // Orange
      'hsl(0, 75%, 55%)',   // Red
      'hsl(142, 65%, 45%)', // Green
      'hsl(45, 93%, 47%)',  // Yellow
      'hsl(330, 60%, 55%)', // Pink
      'hsl(200, 70%, 45%)', // Light Blue
      'hsl(15, 85%, 55%)',  // Red Orange
    ];
    
    // Create a simple hash from category name to ensure consistency
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Spending chart data
  const spendingByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category_name);
      if (existing) {
        existing.value += parseFloat(t.amount);
      } else {
        acc.push({
          name: t.category_name,
          value: parseFloat(t.amount),
          color: getCategoryColor(t.category_name)
        });
      }
      return acc;
    }, []);

  // Trend data - Generate from actual transactions
  const generateTrendData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, "MMM yyyy");
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const monthKey = format(transactionDate, "MMM yyyy");
      
      if (monthlyData[monthKey]) {
        if (transaction.type === "income") {
          monthlyData[monthKey].income += parseFloat(transaction.amount);
        } else {
          monthlyData[monthKey].expense += parseFloat(transaction.amount);
        }
      }
    });
    
    // Convert to array format
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: month.split(' ')[0], // Just the month name
      income: data.income,
      expense: data.expense,
    }));
  };
  
  const trendData = generateTrendData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Wallet className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Futuristic Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-card sticky top-0 z-50 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative bg-primary/10 backdrop-blur-sm p-3 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl" />
                <Wallet className="h-7 w-7 text-primary relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
                  Smart Expense Manager
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {profile?.full_name}!
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="gradient-bg glow-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Balance"
            value={`₹${balance.toFixed(2)}`}
            icon={DollarSign}
            trend={balance >= 0 ? "up" : "down"}
            trendValue={balance >= 0 ? "Positive" : "Negative"}
            color="blue"
          />
          <StatCard
            title="Total Income"
            value={`₹${totalIncome.toFixed(2)}`}
            icon={TrendingUp}
            trend="up"
            trendValue="+12.5%"
            color="green"
          />
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpense.toFixed(2)}`}
            icon={TrendingDown}
            trend="down"
            trendValue="-8.2%"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Add Expense</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-success/5 hover:border-success/30 transition-all"
            onClick={() => {
              setEditTransaction({ type: 'income', category_id: '', amount: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
              setIsFormOpen(true);
            }}
          >
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-sm font-medium">Add Income</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-accent/5 hover:border-accent/30 transition-all"
            onClick={() => setIsBudgetPlannerOpen(true)}
          >
            <Target className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Set Budget</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-secondary/5 hover:border-secondary/30 transition-all"
            onClick={() => setIsReportsOpen(true)}
          >
            <BarChart3 className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium">View Reports</span>
          </Button>
        </motion.div>

        {/* Budget Alert */}
        {profile && (
          <BudgetAlert
            budget={parseFloat(profile.monthly_budget)}
            spent={totalExpense}
          />
        )}

        {/* AI Insights */}
        <AIInsights
          transactions={transactions}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />

        {/* Enhanced Features - Vertically Aligned */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialHealthScore
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
          <QuickStats
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
        </div>

        {/* Gamification & Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Gamification
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
          <ExpenseTracker
            onAddExpense={(expense) => {
              // This could trigger a refresh of transactions or show a toast
              console.log("Quick expense added:", expense);
            }}
          />
        </div>

        {/* Smart Goals */}
        {user && <SmartGoals userId={user.id} />}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={spendingByCategory} />
          <TrendChart data={trendData} />
        </div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TransactionList
            transactions={transactions.slice(0, 10)}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </motion.div>
      </div>

      {/* Transaction Form */}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditTransaction(null);
        }}
        onSuccess={handleFormSuccess}
        editTransaction={editTransaction}
      />

      {/* Budget Planner */}
      {user && (
        <BudgetPlanner
          userId={user.id}
          transactions={transactions}
          isOpen={isBudgetPlannerOpen}
          onOpenChange={setIsBudgetPlannerOpen}
        />
      )}

      {/* Reports Modal */}
      <ReportsModal
        transactions={transactions}
        isOpen={isReportsOpen}
        onOpenChange={setIsReportsOpen}
      />
    </div>
  );
};

export default Dashboard;
