import { useGetReferralStats, useListReferrals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, DollarSign, Gift } from "lucide-react";

export default function Referrals() {
  const { data: stats, isLoading: statsLoading } = useGetReferralStats();
  const { data: referrals, isLoading: referralsLoading } = useListReferrals();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  if (statsLoading || referralsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground mt-2">Invite friends and earn bonuses when they invest.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalReferrals || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bonus Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${stats?.totalBonus.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bonus</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats?.pendingBonus.toLocaleString() || "0"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to invite others.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={stats?.referralLink || ""} className="font-mono text-sm" />
            <Button onClick={() => copyToClipboard(stats?.referralLink || "")} variant="secondary">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Referred Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals && referrals.length > 0 ? (
              referrals.map(ref => (
                <div key={ref.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{ref.referredEmail}</div>
                    <div className="text-sm text-muted-foreground">Joined: {new Date(ref.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">${ref.bonus.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground capitalize">{ref.status}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">You haven't referred anyone yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
