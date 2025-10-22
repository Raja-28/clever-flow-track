import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
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

const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No transactions yet. Add your first transaction to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={transaction.type === "income" ? "default" : "secondary"}
                    className={cn(
                      transaction.type === "income" 
                        ? "bg-accent/10 text-accent hover:bg-accent/20" 
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                  >
                    {transaction.category_name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                  </span>
                </div>
                {transaction.description && (
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-lg font-semibold",
                  transaction.type === "income" ? "text-accent" : "text-destructive"
                )}>
                  {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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
