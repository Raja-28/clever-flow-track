import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  category_name: string;
  amount: number;
  description: string;
  transaction_date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">No transactions yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first transaction to start tracking your finances
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
          <Badge variant="secondary" className="font-normal">
            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 flex items-start gap-4 hover:bg-muted/40 transition-all duration-200 group"
            >
              {/* Icon Circle */}
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                transaction.type === "income" 
                  ? "bg-green-100 text-green-600 group-hover:bg-green-200" 
                  : "bg-red-100 text-red-600 group-hover:bg-red-200"
              )}>
                {transaction.type === "income" ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={transaction.type === "income" ? "default" : "secondary"}
                      className={cn(
                        "font-medium",
                        transaction.type === "income" 
                          ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                          : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                      )}
                    >
                      {transaction.category_name}
                    </Badge>
                  </div>
                  <span className={cn(
                    "text-xl font-bold whitespace-nowrap",
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(transaction.transaction_date)}</span>
                </div>

                {transaction.description && (
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {transaction.description}
                  </p>
                )}

                {/* Action Buttons - Mobile Friendly */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(transaction)}
                    className="h-8 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;