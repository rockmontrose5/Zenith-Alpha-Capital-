import { useListInvestmentPlans, useCreatePortfolio } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, TrendingUp, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPortfoliosQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

export default function Invest() {
  const { data: plans, isLoading } = useListInvestmentPlans();
  const createPortfolio = useCreatePortfolio();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInvest = async () => {
    if (!selectedPlan || !amount) return;

    try {
      await createPortfolio.mutateAsync({
        data: {
          planId: selectedPlan,
          amount: Number(amount)
        }
      });
      
      toast({
        title: "Investment Successful",
        description: "Your portfolio has been created.",
      });
      
      setIsDialogOpen(false);
      setAmount("");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: getListPortfoliosQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      
    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "Please check your balance and try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading plans...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investment Plans</h1>
        <p className="text-muted-foreground mt-2">Select a plan to start growing your wealth.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.filter(p => p.isActive).map(plan => (
          <Card key={plan.id} className="relative overflow-hidden group border-border bg-card flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                {plan.name}
                <span className="text-sm font-normal px-2 py-1 bg-primary/20 text-primary rounded-full">
                  {plan.riskLevel} Risk
                </span>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center text-muted-foreground"><TrendingUp className="mr-2 h-4 w-4" /> Return</div>
                <div className="font-semibold text-primary">{plan.returnRate}%</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center text-muted-foreground"><Clock className="mr-2 h-4 w-4" /> Duration</div>
                <div className="font-semibold">{plan.durationDays} Days</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center text-muted-foreground"><ShieldCheck className="mr-2 h-4 w-4" /> Min Invest</div>
                <div className="font-semibold">${plan.minAmount.toLocaleString()}</div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={isDialogOpen && selectedPlan === plan.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) setSelectedPlan(plan.id);
                else setSelectedPlan(null);
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full">Select Plan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invest in {plan.name}</DialogTitle>
                    <DialogDescription>
                      Enter the amount you wish to invest. Minimum amount is ${plan.minAmount.toLocaleString()}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        min={plan.minAmount}
                        max={plan.maxAmount || undefined}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Min ${plan.minAmount}`}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvest} disabled={!amount || Number(amount) < plan.minAmount || createPortfolio.isPending}>
                      {createPortfolio.isPending ? "Processing..." : "Confirm Investment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
