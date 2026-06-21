import { useGetDashboardSummary, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClerk } from "@clerk/react";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { signOut } = useClerk();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">Welcome back, {user?.firstName || "Investor"}.</p>
          </div>
          <button onClick={() => signOut()} className="text-sm font-medium hover:text-primary transition-colors">
            Sign Out
          </button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${summary?.totalBalance.toLocaleString() ?? "0"}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${summary?.totalInvested.toLocaleString() ?? "0"}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">${summary?.totalProfit.toLocaleString() ?? "0"}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {summary.recentTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="font-semibold">
                      {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
