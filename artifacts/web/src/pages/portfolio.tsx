import { useListPortfolios } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Portfolio() {
  const { data: portfolios, isLoading } = useListPortfolios();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading portfolio...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Investments</h1>
        <p className="text-muted-foreground mt-2">Track the performance of your current portfolios.</p>
      </div>

      <div className="space-y-4">
        {portfolios && portfolios.length > 0 ? (
          portfolios.map(portfolio => {
            const start = new Date(portfolio.startDate).getTime();
            const end = new Date(portfolio.endDate).getTime();
            const now = new Date().getTime();
            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

            return (
              <Card key={portfolio.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">{portfolio.planName}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Started: {new Date(portfolio.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={portfolio.status === 'active' ? 'default' : 'secondary'} className={portfolio.status === 'active' ? "bg-primary text-primary-foreground" : ""}>
                    {portfolio.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Invested Amount</div>
                      <div className="text-lg font-semibold">${portfolio.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Current Value</div>
                      <div className="text-lg font-semibold">${portfolio.currentValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Profit</div>
                      <div className="text-lg font-semibold text-green-500">+${portfolio.profit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Target Return</div>
                      <div className="text-lg font-semibold">{portfolio.returnRate}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{new Date(portfolio.startDate).toLocaleDateString()}</span>
                      <span>{new Date(portfolio.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-card border-border border-dashed p-8 text-center">
            <CardContent>
              <p className="text-muted-foreground">You don't have any active investments yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
