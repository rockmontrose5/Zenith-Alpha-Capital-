import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, ArrowRightLeft, Briefcase } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading admin stats...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-2">Executive dashboard and system statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeUsers || 0} active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${stats?.totalDeposits?.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawals</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${stats?.totalWithdrawals?.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Investments</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalInvestments || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link href="/admin/transactions">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-500">{stats?.pendingTransactions || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">Requires approval</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.recentSignups || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">In the last 7 days</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/admin/plans">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <span className="font-semibold">Manage Investment Plans</span>
              <ArrowRightLeft className="h-5 w-5" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/blog">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <span className="font-semibold">Manage Blog Posts</span>
              <Briefcase className="h-5 w-5" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
