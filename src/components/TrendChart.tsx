import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface TrendChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

const TrendChart = ({ data }: TrendChartProps) => {
  // Calculate statistics
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const avgIncome = totalIncome / data.length;
  const avgExpense = totalExpense / data.length;
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  // Calculate trend (comparing last month to previous average)
  const lastMonth = data[data.length - 1];
  const prevMonths = data.slice(0, -1);
  const prevAvgIncome = prevMonths.reduce((sum, item) => sum + item.income, 0) / prevMonths.length;
  const prevAvgExpense = prevMonths.reduce((sum, item) => sum + item.expense, 0) / prevMonths.length;
  
  const incomeTrend = prevAvgIncome > 0 ? ((lastMonth.income - prevAvgIncome) / prevAvgIncome * 100) : 0;
  const expenseTrend = prevAvgExpense > 0 ? ((lastMonth.expense - prevAvgExpense) / prevAvgExpense * 100) : 0;

  // Enhanced data with savings
  const enhancedData = data.map(item => ({
    ...item,
    savings: item.income - item.expense,
    balance: item.income - item.expense
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const savings = income - expense;

      return (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-xl p-4 shadow-2xl min-w-[200px]">
          <p className="font-bold text-gray-900 mb-3 text-center border-b pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <span className="font-bold text-green-600">₹{income.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Expense</span>
              </div>
              <span className="font-bold text-red-600">₹{expense.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${savings >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                <span className="text-sm text-gray-600">Net</span>
              </div>
              <span className={`font-bold ${savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₹{savings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Legend
  const CustomLegend = () => {
    return (
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs font-medium text-green-700">Income</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs font-medium text-red-700">Expense</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-blue-700">Net Savings</span>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Monthly Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Activity className="h-12 w-12 text-gray-300" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-gray-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">No Trend Data</p>
              <p className="text-sm text-gray-500">Add transactions to see your monthly trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all group">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Income vs Expense Trend
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Savings Rate</p>
            <p className={`text-xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Trend Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-green-700">Income Trend</span>
              {incomeTrend > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : incomeTrend < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <p className={`text-lg font-bold ${incomeTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeTrend >= 0 ? '+' : ''}{incomeTrend.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600 mt-1">Last month vs average</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-red-700">Expense Trend</span>
              {expenseTrend > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              ) : expenseTrend < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-green-600" />
              ) : (
                <Minus className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <p className={`text-lg font-bold ${expenseTrend <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseTrend >= 0 ? '+' : ''}{expenseTrend.toFixed(1)}%
            </p>
            <p className="text-xs text-red-600 mt-1">Last month vs average</p>
          </div>
        </div>

        {/* Enhanced Chart */}
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart 
            data={enhancedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              opacity={0.5}
            />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {/* Bars with gradients */}
            <Bar 
              dataKey="income" 
              fill="url(#incomeGradient)"
              name="Income" 
              radius={[8, 8, 0, 0]}
              filter="url(#shadow)"
              animationDuration={1000}
            />
            <Bar 
              dataKey="expense" 
              fill="url(#expenseGradient)"
              name="Expense" 
              radius={[8, 8, 0, 0]}
              filter="url(#shadow)"
              animationDuration={1000}
            />
            
            {/* Net savings line */}
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7, fill: '#3b82f6' }}
              name="Net Savings"
              animationDuration={1200}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Period Summary ({data.length} months)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Avg Income</p>
              </div>
              <p className="text-lg font-bold text-green-600">₹{avgIncome.toFixed(0)}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs text-red-700 font-medium">Avg Expense</p>
              </div>
              <p className="text-lg font-bold text-red-600">₹{avgExpense.toFixed(0)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Net Savings</p>
              </div>
              <p className={`text-lg font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₹{netSavings.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Month-by-month comparison */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Monthly Breakdown
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {enhancedData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">{item.month}</span>
                <div className="flex items-center gap-4 flex-1 justify-end">
                  <div className="text-right">
                    <p className="text-xs text-green-600">₹{item.income.toFixed(0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600">₹{item.expense.toFixed(0)}</p>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <p className={`text-sm font-bold ${item.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {item.savings >= 0 ? '+' : ''}₹{item.savings.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;