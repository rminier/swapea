"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Smartphone, Laptop, Globe, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettingsPage() {
  const handleSignOutEverywhere = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Signing out from all devices...",
        success: "Signed out from all devices successfully",
        error: "Failed to sign out",
      }
    );
  };

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and active sessions.</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Account Security</CardTitle>
              </div>
              <CardDescription>Update your password and enable two-factor authentication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                </div>
                <Button variant="outline" className="rounded-full">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" className="rounded-full">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Active Sessions</CardTitle>
              </div>
              <CardDescription>You are currently logged in on these devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-primary/5 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Laptop className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Chrome on Windows (Current Session)</p>
                    <p className="text-xs text-muted-foreground">New York, USA • 192.168.1.1</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">Active Now</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Safari on iPhone 15</p>
                    <p className="text-xs text-muted-foreground">Austin, USA • 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-full">Revoke</Button>
              </div>

              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl gap-2"
                  onClick={handleSignOutEverywhere}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out from All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
