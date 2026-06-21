import { useListTransactions, useCreateTransaction } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListTransactionsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

export default function Transactions() {
  const { data: transactions, isLoading } = useListTransactions();
  const createTransaction = useCreateTransaction();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [walletAddress, setWalletAddress] = useState("");

  const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
    if (!amount) return;

    try {
      await createTransaction.mutateAsync({
        data: {
          type,
          amount: Number(amount),
          paymentMethod,
          walletAddress: type === 'withdrawal' ? walletAddress : undefined
        }
      });
      
      toast({
        title: "Request Submitted",
        description: `Your ${type} request is pending approval.`,
      });
      
      setIsDepositOpen(false);
      setIsWithdrawOpen(false);
      setAmount("");
      setWalletAddress("");
      
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-500';
      case 'profit': return 'text-green-500';
      case 'bonus': return 'text-green-500';
      case 'referral': return 'text-green-500';
      case 'withdrawal': return 'text-red-500';
      default: return 'text-foreground';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-2">View and manage your transaction history.</p>
        </div>
        <div className="flex gap-2">
          {/* Deposit Dialog */}
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Deposit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Make a Deposit</DialogTitle>
                <DialogDescription>Add funds to your account balance.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Cryptocurrency (BTC/ETH/USDT)</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
                <Button onClick={() => handleTransaction('deposit')} disabled={createTransaction.isPending}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Withdraw Dialog */}
          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Withdraw</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>Withdraw funds to your crypto wallet.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
                <Button onClick={() => handleTransaction('withdrawal')} disabled={createTransaction.isPending}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-card border-border">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 py-4 border-b border-border/50">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              <TabsTrigger value="profit">Profits</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{tx.id}</td>
                      <td className="px-6 py-4 capitalize font-medium">{tx.type}</td>
                      <td className={`px-6 py-4 font-semibold ${getTypeColor(tx.type)}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`border-0 capitalize ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {!transactions?.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
