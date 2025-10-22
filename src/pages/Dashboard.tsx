import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import SpendingChart from "@/components/SpendingChart";
import TrendChart from "@/components/TrendChart";
import BudgetAlert from "@/components/BudgetAlert";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import UserAvatar from "@/components/UserAvatar";
import { motion } from "framer-motion";

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

  // Calculate statistics
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date >= monthStart && date <= monthEnd;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Calculate forecast (simple moving average)
  const last3Months = [0, 1, 2].map(i => {
    const monthDate = subMonths(currentMonth, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    return transactions
      .filter(t => {
        const date = new Date(t.transaction_date);
        return t.type === "expense" && date >= start && date <= end;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  });

  const forecastExpense = last3Months.reduce((a, b) => a + b, 0) / 3;

  // Category breakdown
  const categoryData = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((acc: any, t) => {
      const existing = acc.find((item: any) => item.name === t.category_name);
      if (existing) {
        existing.value += parseFloat(t.amount);
      } else {
        acc.push({
          name: t.category_name,
          value: parseFloat(t.amount),
          color: `hsl(var(--chart-${(acc.length % 5) + 1}))`,
        });
      }
      return acc;
    }, []);

  // Monthly trend data
  const trendData = [0, 1, 2, 3, 4, 5].reverse().map(i => {
    const monthDate = subMonths(currentMonth, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= start && date <= end;
    });

    return {
      month: format(monthDate, "MMM"),
      income: monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      expense: monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md shadow-[var(--shadow-card)]">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Smart Expense Manager</h1>
                    <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserAvatar fullName={profile?.full_name || "User"} email={user?.email} />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
            {/* Budget Alert */}
            {profile && (
              <BudgetAlert
                budget={parseFloat(profile.monthly_budget)}
                spent={totalExpense}
                forecast={forecastExpense}
              />
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Balance"
                value={`₹${balance.toFixed(2)}`}
                icon={DollarSign}
                variant="balance"
              />
              <StatCard
                title="Total Income"
                value={`₹${totalIncome.toFixed(2)}`}
                icon={TrendingUp}
                variant="income"
              />
              <StatCard
                title="Total Expense"
                value={`₹${totalExpense.toFixed(2)}`}
                icon={TrendingDown}
                variant="expense"
              />
              <StatCard
                title="Forecast"
                value={`₹${forecastExpense.toFixed(2)}`}
                icon={TrendingUp}
                trend={{
                  value: forecastExpense > totalExpense 
                    ? `+${((forecastExpense - totalExpense) / totalExpense * 100).toFixed(1)}%`
                    : `-${((totalExpense - forecastExpense) / totalExpense * 100).toFixed(1)}%`,
                  isPositive: forecastExpense <= totalExpense,
                }}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SpendingChart data={categoryData} />
              <TrendChart data={trendData} />
            </div>

            {/* Transactions List */}
            <TransactionList
              transactions={transactions.slice(0, 10)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </main>

          {/* Floating Action Button */}
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Transaction Form Dialog */}
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
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
