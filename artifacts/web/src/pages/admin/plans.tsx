import { useListInvestmentPlans, useCreateInvestmentPlan, useDeleteInvestmentPlan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListInvestmentPlansQueryKey } from "@workspace/api-client-react";
import { Trash2, Plus } from "lucide-react";

export default function AdminPlans() {
  const { data: plans, isLoading } = useListInvestmentPlans();
  const deletePlan = useDeleteInvestmentPlan();
  const createPlan = useCreateInvestmentPlan();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateMock = async () => {
    try {
      await createPlan.mutateAsync({
        data: {
          name: "New Elite Plan",
          description: "Exclusive new tier for high net-worth individuals.",
          minAmount: 50000,
          returnRate: 25,
          durationDays: 180,
          riskLevel: "medium",
          isActive: true
        } as any
      });
      toast({ title: "Created", description: "Plan created." });
      queryClient.invalidateQueries({ queryKey: getListInvestmentPlansQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlan.mutateAsync({ id });
      toast({ title: "Deleted", description: "Plan removed." });
      queryClient.invalidateQueries({ queryKey: getListInvestmentPlansQueryKey() });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading plans...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Plans</h1>
        <Button onClick={handleCreateMock} disabled={createPlan.isPending}>
          <Plus size={16} className="mr-2" /> Add Plan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans?.map((plan) => (
          <Card key={plan.id} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(plan.id)}
                disabled={deletePlan.isPending}
              >
                <Trash2 size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{plan.description}</p>
              <div className="pt-2 flex justify-between">
                <span>Min: ${plan.minAmount.toLocaleString()}</span>
                <span>{plan.returnRate}% Return</span>
              </div>
              <div className="flex justify-between">
                <span>{plan.durationDays} Days</span>
                <span className="capitalize">{plan.riskLevel} Risk</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
