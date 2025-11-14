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
      <Card className="glass-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-warning to-destructive p-2 rounded-lg">
              <Target className="h-5 w-5 text-warning-foreground" />
            </div>
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-border rounded-full animate-ping opacity-20"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">No Expense Data</p>
              <p className="text-sm text-muted-foreground">Start adding expenses to see your spending breakdown</p>
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
        <div className="bg-card/95 backdrop-blur-xl border-2 border-border rounded-xl p-4 shadow-2xl min-w-[180px]">
          <p className="font-bold text-card-foreground mb-3 text-center border-b border-border pb-2">{data.name}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-destructive">
                ₹{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Share</span>
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
    <Card className="glass-card group">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-gradient-to-br from-warning to-destructive p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 text-warning-foreground" />
            </div>
            Category Breakdown
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Expenses</p>
            <p className="text-xl font-bold text-destructive">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Vertical layout: Chart on top, Breakdown below */}
        <div className="space-y-6">
          
          {/* Donut Chart */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={400}>
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
                  outerRadius={140}
                  innerRadius={80}
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Breakdown List */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Category Details
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted pr-2">
              {data
                .sort((a, b) => b.value - a.value) // Sort by highest spending
                .map((item, index) => {
                  const percentage = ((item.value / totalAmount) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold text-muted-foreground flex-shrink-0">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-sm font-bold text-destructive">
                          ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Quick Stats (moved pt-4 to pt-6 for better spacing) */}
        <div className="mt-6 pt-6 border-t border-border">
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