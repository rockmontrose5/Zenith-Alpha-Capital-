import { useListAllUsers, useUpdateAdminUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListAllUsersQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { data: users, isLoading } = useListAllUsers();
  const updateUser = useUpdateAdminUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (userId: number, status: 'active' | 'suspended' | 'pending') => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: { status } as any // The API types might not match exactly, so casting to any for safety
      });
      toast({ title: "User Updated", description: "User status has been changed." });
      queryClient.invalidateQueries({ queryKey: getListAllUsersQueryKey() });
    } catch (error) {
      toast({ title: "Update Failed", description: "Failed to update user.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Balance</th>
                  <th className="px-6 py-4 font-medium">KYC</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4 font-semibold">${user.balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{user.kycStatus || 'none'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="capitalize bg-transparent border">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select 
                        defaultValue={user.status} 
                        onValueChange={(val) => handleStatusChange(user.id, val as any)}
                        disabled={updateUser.isPending}
                      >
                        <SelectTrigger className="w-[130px] ml-auto h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
