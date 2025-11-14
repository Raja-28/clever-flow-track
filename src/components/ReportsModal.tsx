import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  category_name: string;
  amount: number;
  description: string;
  transaction_date: string;
}

interface ReportsModalProps {
  transactions: Transaction[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportsModal = ({ transactions, isOpen, onOpenChange }: ReportsModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [reportType, setReportType] = useState("summary");

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "current-month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last-month":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "current-year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case "last-year":
        const lastYear = subYears(now, 1);
        startDate = startOfYear(lastYear);
        endDate = endOfYear(lastYear);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const categoryBreakdown = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc: { [key: string]: number }, t) => {
      acc[t.category_name] = (acc[t.category_name] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "current-month":
        return format(new Date(), "MMMM yyyy");
      case "last-month":
        return format(subMonths(new Date(), 1), "MMMM yyyy");
      case "current-year":
        return format(new Date(), "yyyy");
      case "last-year":
        return format(subYears(new Date(), 1), "yyyy");
      default:
        return "Selected Period";
    }
  };

  const exportReport = () => {
    const reportData = {
      period: getPeriodLabel(),
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate: savingsRate.toFixed(2) + "%",
        transactionCount: filteredTransactions.length
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / totalExpense) * 100).toFixed(1) + "%"
      })),
      transactions: filteredTransactions.map(t => ({
        date: t.transaction_date,
        type: t.type,
        category: t.category_name,
        amount: t.amount,
        description: t.description
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${getPeriodLabel().toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Financial Reports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Controls */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="current-year">Current Year</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                      <SelectItem value="category">Category Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={exportReport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Header */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Report for {getPeriodLabel()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredTransactions.length} transactions
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-success">₹{totalIncome.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expense</p>
                      <p className="text-2xl font-bold text-destructive">₹{totalExpense.toFixed(2)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Savings</p>
                      <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ₹{netSavings.toFixed(2)}
                      </p>
                    </div>
                    <BarChart3 className={`h-8 w-8 ${netSavings >= 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Savings Rate</p>
                      <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                    <PieChart className={`h-8 w-8 ${savingsRate >= 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          {reportType === "summary" || reportType === "category" ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map(([category, amount], index) => {
                    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="font-bold text-destructive">₹{amount.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Detailed Transaction List */}
          {reportType === "detailed" ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === "income" ? "bg-success" : "bg-destructive"
                          }`} />
                          <span className="font-medium">{transaction.category_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1 ml-6">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${
                          transaction.type === "income" ? "text-success" : "text-destructive"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
