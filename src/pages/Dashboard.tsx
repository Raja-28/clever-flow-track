import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
      }
      return acc;
    }, []);

  // Trend data
  const trendData = Array.from({ length: 6 }, (_, i) => ({
    month: format(new Date().setMonth(new Date().getMonth() - (5 - i)), "MMM"),
    income: Math.random() * 20000 + 10000,
    expense: Math.random() * 15000 + 8000,
  }));

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
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl glow-primary"
              >
                <Wallet className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
                  Smart Expense Manager
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name}!
                </p>
              </div>
            </div>
            <div className="flex gap-2">
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

        {/* Budget Alert */}
        {profile && (
          <BudgetAlert
            budget={parseFloat(profile.monthly_budget)}
            spent={totalExpense}
          />
        )}

        {/* AI Insights & Gamification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsights
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
          <Gamification
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
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
    </div>
  );
};

export default Dashboard;
