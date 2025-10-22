import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingDown, Target } from "lucide-react";

interface SpendingChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const SpendingChart = ({ data }: SpendingChartProps) => {
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="h-12 w-12 text-gray-300" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-gray-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">No Expense Data</p>
              <p className="text-sm text-gray-500">Start adding expenses to see your spending breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom Tooltip remains the same - it's well-styled
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-xl p-4 shadow-2xl min-w-[180px]">
          <p className="font-bold text-gray-900 mb-3 text-center border-b pb-2">{data.name}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="font-bold text-red-600">
                ₹{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t">
              <span className="text-sm text-gray-600">Share</span>
              <span className="font-bold" style={{ color: data.payload.color }}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Label remains the same
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Hide labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all group">
      <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 text-white" />
            </div>
            Category Breakdown
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Main layout grid: Chart on left, Breakdown on right (on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-6 items-center">
          
          {/* Column 1: Donut Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter id="pieChartShadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      filter="url(#pieChartShadow)"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {/* Legend is now handled by the list in the next column */}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Column 2: Spending Breakdown List */}
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Category Details
            </p>
            <div className="space-y-2 lg:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
              {data
                .sort((a, b) => b.value - a.value) // Sort by highest spending
                .map((item, index) => {
                  const percentage = ((item.value / totalAmount) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600 flex-shrink-0">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-sm font-bold text-red-600">
                          ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Quick Stats (moved pt-4 to pt-6 for better spacing) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-700 font-medium mb-1">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{data.length}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xs text-red-700 font-medium mb-1">Highest</p>
              <p className="text-lg font-bold text-red-600">
                ₹{Math.max(...data.map(d => d.value)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs text-green-700 font-medium mb-1">Lowest</p>
              <p className="text-lg font-bold text-green-600">
                ₹{Math.min(...data.map(d => d.value)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;