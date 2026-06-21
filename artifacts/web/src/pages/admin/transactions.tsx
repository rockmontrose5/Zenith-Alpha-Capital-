import { useListAllTransactions, useApproveTransaction, useRejectTransaction } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAllTransactionsQueryKey, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Check, X } from "lucide-react";

export default function AdminTransactions() {
  // Pass explicit params to match the generated hook's signature if needed
  const { data: transactions, isLoading } = useListAllTransactions({ status: "pending" });
  const approveTx = useApproveTransaction();
  const rejectTx = useRejectTransaction();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApprove = async (id: number) => {
    try {
      await approveTx.mutateAsync({ id });
      toast({ title: "Approved", description: "Transaction approved successfully." });
      queryClient.invalidateQueries({ queryKey: getListAllTransactionsQueryKey({ status: "pending" }) });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve.", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectTx.mutateAsync({ id, data: { reason: "Admin rejected" } });
      toast({ title: "Rejected", description: "Transaction rejected." });
      queryClient.invalidateQueries({ queryKey: getListAllTransactionsQueryKey({ status: "pending" }) });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Transactions</h1>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">ID / Date</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions?.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs">#{tx.id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{tx.userId}</td>
                    <td className="px-6 py-4 capitalize">{tx.type}</td>
                    <td className="px-6 py-4 font-semibold">${tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {tx.paymentMethod && <span>Method: {tx.paymentMethod}<br/></span>}
                        {tx.walletAddress && <span>Wallet: {tx.walletAddress}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                        onClick={() => handleApprove(tx.id)}
                        disabled={approveTx.isPending || rejectTx.isPending}
                      >
                        <Check size={16} className="mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                        onClick={() => handleReject(tx.id)}
                        disabled={approveTx.isPending || rejectTx.isPending}
                      >
                        <X size={16} className="mr-1" /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
                {!transactions?.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No pending transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
