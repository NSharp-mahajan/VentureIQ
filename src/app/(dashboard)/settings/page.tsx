import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and subscriptions.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" disabled />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Firm / Organization</CardTitle>
              <CardDescription>Manage your firm details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firm">Firm Name</Label>
                <Input id="firm" defaultValue="Venture Capital Partners" />
              </div>
              <Button>Update Firm</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage password and 2FA settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Security settings are managed securely via Clerk Authentication.</p>
              <Button variant="outline">Open Auth Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="border-border/50 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>You are currently on the Pro tier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-bold text-primary">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">Up to 50 comprehensive reports per month.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline">Manage Billing</Button>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
