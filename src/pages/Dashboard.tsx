import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Wallet, TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart, BarChart3, Filter, Download, Bell, Settings, ChevronDown, Zap, Award, Clock } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import SpendingChart from "@/components/SpendingChart";
import TrendChart from "@/components/TrendChart";
import BudgetAlert from "@/components/BudgetAlert";
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, isToday, isThisWeek, isThisMonth } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");
  const [showInsights, setShowInsights] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setAnimateStats(true), 100);
    }
  }, [isLoading]);

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

  // Filter transactions based on timeFilter
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const date = new Date(t.transaction_date);
      switch (timeFilter) {
        case "today":
          return isToday(date);
        case "week":
          return isThisWeek(date);
        case "month":
          return isThisMonth(date);
        case "all":
          return true;
        default:
          return isThisMonth(date);
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Calculate statistics
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date >= monthStart && date <= monthEnd;
  });

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

  // Today's transactions
  const todayTransactions = transactions.filter(t => isToday(new Date(t.transaction_date)));
  const todayExpense = todayTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  // Top spending category
  const categoryTotals = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((acc: any, t) => {
      acc[t.category_name] = (acc[t.category_name] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

  const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0];

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

  // Budget progress
  const budgetUsed = profile ? (totalExpense / parseFloat(profile.monthly_budget)) * 100 : 0;

  // Export data
  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Amount', 'Description'],
      ...filteredTransactions.map(t => [
        t.transaction_date,
        t.type,
        t.category_name,
        t.amount,
        t.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success("Transactions exported successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Wallet className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
            <div className="absolute inset-0 h-16 w-16 mx-auto animate-ping opacity-20">
              <Wallet className="h-16 w-16 text-primary" />
            </div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header with Gradient */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Expense Manager
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Welcome back, {profile?.full_name}!
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="hover:scale-105 transition-transform">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="hover:scale-105 transition-transform">
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="hover:scale-105 transition-transform">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Quick Stats Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Today's Spending:</span>
                <span className="text-sm font-bold text-blue-600">₹{todayExpense.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Savings Rate:</span>
                <span className={`text-sm font-bold ${savingsRate > 20 ? 'text-green-600' : 'text-orange-600'}`}>
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              {topCategory && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Top Category:</span>
                  <span className="text-sm font-bold text-amber-600">{topCategory[0]}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="hover:scale-105 transition-transform">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['today', 'week', 'month', 'all'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      timeFilter === filter
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Alert */}
        {profile && (
          <div className="transform hover:scale-[1.01] transition-transform">
            <BudgetAlert
              budget={parseFloat(profile.monthly_budget)}
              spent={totalExpense}
              forecast={forecastExpense}
            />
          </div>
        )}

        {/* Enhanced Stats Cards with Animation */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className={`transform transition-all duration-500 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '0ms'}}>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-blue-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">Total Balance</span>
                <DollarSign className="h-8 w-8 text-blue-100" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹{balance.toFixed(2)}</p>
              <p className="text-xs text-blue-100">
                {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} overview
              </p>
            </div>
          </div>

          <div className={`transform transition-all duration-500 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '100ms'}}>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-green-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-sm font-medium">Total Income</span>
                <TrendingUp className="h-8 w-8 text-green-100" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹{totalIncome.toFixed(2)}</p>
              <p className="text-xs text-green-100">
                {filteredTransactions.filter(t => t.type === "income").length} transactions
              </p>
            </div>
          </div>

          <div className={`transform transition-all duration-500 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '200ms'}}>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-red-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-100 text-sm font-medium">Total Expense</span>
                <TrendingDown className="h-8 w-8 text-red-100" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹{totalExpense.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-red-400/30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{width: `${Math.min(budgetUsed, 100)}%`}}
                  />
                </div>
                <span className="text-xs text-red-100">{budgetUsed.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className={`transform transition-all duration-500 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '300ms'}}>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-purple-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm font-medium">Forecast</span>
                <Zap className="h-8 w-8 text-purple-100" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹{forecastExpense.toFixed(2)}</p>
              <p className={`text-xs ${forecastExpense <= totalExpense ? 'text-purple-100' : 'text-purple-200'}`}>
                {forecastExpense > totalExpense 
                  ? `+${((forecastExpense - totalExpense) / totalExpense * 100).toFixed(1)}% predicted`
                  : `${((totalExpense - forecastExpense) / totalExpense * 100).toFixed(1)}% under forecast`}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Insights Card */}
        {showInsights && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-200 transform hover:scale-[1.01] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-amber-500 rounded-full p-2">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-2">Smart Insights</h3>
                  <ul className="space-y-1 text-sm text-amber-800">
                    {savingsRate > 30 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Great job! You're saving {savingsRate.toFixed(0)}% of your income.
                      </li>
                    )}
                    {budgetUsed > 80 && budgetUsed < 100 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        You've used {budgetUsed.toFixed(0)}% of your monthly budget.
                      </li>
                    )}
                    {forecastExpense > totalExpense * 1.1 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Based on trends, you might spend ₹{(forecastExpense - totalExpense).toFixed(2)} more this month.
                      </li>
                    )}
                    {todayExpense > forecastExpense / 30 && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Today's spending is higher than your daily average.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => setShowInsights(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all transform hover:scale-[1.01]">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold">Spending by Category</h2>
            </div>
            <SpendingChart data={categoryData} />
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all transform hover:scale-[1.01]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold">Income vs Expense Trend</h2>
            </div>
            <TrendChart data={trendData} />
          </div>
        </div>

        {/* Enhanced Transactions List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </h2>
            <span className="text-sm text-muted-foreground">
              Showing {Math.min(10, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </span>
          </div>
          <TransactionList
            transactions={filteredTransactions.slice(0, 10)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

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
  );
};

export default Dashboard;