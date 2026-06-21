import { useGetMe, useUpdateMe, useSubmitKyc } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function Profile() {
  const { data: user, isLoading } = useGetMe();
  const updateMe = useUpdateMe();
  const submitKyc = useSubmitKyc();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const [kycFullName, setKycFullName] = useState("");
  const [kycDob, setKycDob] = useState("");
  const [kycDocType, setKycDocType] = useState("passport");
  const [kycDocNum, setKycDocNum] = useState("");
  const [kycAddress, setKycAddress] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateMe.mutateAsync({
        data: { firstName, lastName, phone, country }
      });
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (error) {
      toast({ title: "Update Failed", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleSubmitKyc = async () => {
    try {
      await submitKyc.mutateAsync({
        data: {
          fullName: kycFullName,
          dateOfBirth: kycDob,
          documentType: kycDocType as any,
          documentNumber: kycDocNum,
          address: kycAddress
        }
      });
      toast({ title: "KYC Submitted", description: "Your verification request is pending." });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (error) {
      toast({ title: "Submission Failed", description: "Failed to submit KYC.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and verification.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={country} onChange={e => setCountry(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateProfile} disabled={updateMe.isPending}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Identity Verification (KYC)</CardTitle>
            <CardDescription>
              Status: <span className="font-semibold capitalize text-primary">{user?.kycStatus || 'none'}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.kycStatus === 'none' || user?.kycStatus === 'rejected' ? (
              <>
                <div className="space-y-2">
                  <Label>Full Legal Name</Label>
                  <Input value={kycFullName} onChange={e => setKycFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={kycDob} onChange={e => setKycDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={kycDocType} onValueChange={setKycDocType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Number</Label>
                  <Input value={kycDocNum} onChange={e => setKycDocNum(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Residential Address</Label>
                  <Input value={kycAddress} onChange={e => setKycAddress(e.target.value)} />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Your KYC is currently {user?.kycStatus}. No further action is required at this time.
              </div>
            )}
          </CardContent>
          {(user?.kycStatus === 'none' || user?.kycStatus === 'rejected') && (
            <CardFooter>
              <Button onClick={handleSubmitKyc} disabled={submitKyc.isPending || !kycFullName || !kycDob || !kycDocNum}>
                Submit for Verification
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
