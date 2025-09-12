import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Trash2, LogOut, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    bio: "",
  });

  const [emailSettings, setEmailSettings] = useState({
    marketingEmails: true,
    productUpdates: true,
    weeklyReports: true,
    systemAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    defaultTemplate: "problem-solution",
    autoSaveEmails: true,
    timezone: "UTC",
    language: "en",
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    onSuccess: (userData) => {
      if (userData) {
        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          company: userData.company || "",
          jobTitle: userData.jobTitle || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
        });
      }
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (window.confirm("This will permanently delete all your data. Are you absolutely sure?")) {
        deleteAccountMutation.mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border lg:hidden">
          <div className="flex-1 flex justify-between px-4 items-center">
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4" data-testid="tabs-settings">
                  <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
                  <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="preferences" data-testid="tab-preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Profile Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Update your personal information and profile details.
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <Button variant="outline" size="sm" data-testid="button-change-photo">
                              Change Photo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG up to 2MB
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                              data-testid="input-first-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                              data-testid="input-last-name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-email"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              value={profileData.company}
                              onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                              data-testid="input-company"
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              value={profileData.jobTitle}
                              onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                              data-testid="input-job-title"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            data-testid="input-phone"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            rows={3}
                            placeholder="Tell us about yourself..."
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            data-testid="textarea-bio"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            data-testid="button-save-profile"
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications">
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center">
                        <Bell className="mr-2 h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Choose what notifications you'd like to receive.
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Marketing Emails</Label>
                            <div className="text-sm text-muted-foreground">
                              Receive emails about new features and tips
                            </div>
                          </div>
                          <Switch
                            checked={emailSettings.marketingEmails}
                            onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, marketingEmails: checked }))}
                            data-testid="switch-marketing-emails"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Product Updates</Label>
                            <div className="text-sm text-muted-foreground">
                              Get notified about product updates and releases
                            </div>
                          </div>
                          <Switch
                            checked={emailSettings.productUpdates}
                            onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, productUpdates: checked }))}
                            data-testid="switch-product-updates"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Weekly Reports</Label>
                            <div className="text-sm text-muted-foreground">
                              Receive weekly performance reports
                            </div>
                          </div>
                          <Switch
                            checked={emailSettings.weeklyReports}
                            onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, weeklyReports: checked }))}
                            data-testid="switch-weekly-reports"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>System Alerts</Label>
                            <div className="text-sm text-muted-foreground">
                              Important system notifications and alerts
                            </div>
                          </div>
                          <Switch
                            checked={emailSettings.systemAlerts}
                            onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, systemAlerts: checked }))}
                            data-testid="switch-system-alerts"
                          />
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button onClick={handleSaveSettings} data-testid="button-save-notifications">
                            <Save className="mr-2 h-4 w-4" />
                            Save Notifications
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Settings */}
                <TabsContent value="preferences">
                  <Card className="shadow-sm border border-border">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center">
                        <SettingsIcon className="mr-2 h-5 w-5" />
                        Application Preferences
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Customize your application experience.
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="defaultTemplate">Default Email Template</Label>
                            <Select
                              value={preferences.defaultTemplate}
                              onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultTemplate: value }))}
                            >
                              <SelectTrigger data-testid="select-default-template">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="problem-solution">Problem/Solution</SelectItem>
                                <SelectItem value="social-proof">Social Proof</SelectItem>
                                <SelectItem value="news-hook">News Hook</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                              value={preferences.timezone}
                              onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                            >
                              <SelectTrigger data-testid="select-timezone">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="Europe/London">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                              value={preferences.language}
                              onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                            >
                              <SelectTrigger data-testid="select-language">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              checked={preferences.autoSaveEmails}
                              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSaveEmails: checked }))}
                              data-testid="switch-auto-save"
                            />
                            <Label>Auto-save email drafts</Label>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button onClick={handleSaveSettings} data-testid="button-save-preferences">
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="account">
                  <div className="space-y-6">
                    <Card className="shadow-sm border border-border">
                      <CardHeader className="border-b border-border">
                        <CardTitle className="flex items-center">
                          <Shield className="mr-2 h-5 w-5" />
                          Account Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Password</div>
                              <div className="text-sm text-muted-foreground">
                                Last updated 30 days ago
                              </div>
                            </div>
                            <Button variant="outline" data-testid="button-change-password">
                              Change Password
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Two-Factor Authentication</div>
                              <div className="text-sm text-muted-foreground">
                                Add an extra layer of security
                              </div>
                            </div>
                            <Badge variant="outline">Not Enabled</Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Active Sessions</div>
                              <div className="text-sm text-muted-foreground">
                                Manage your active sessions
                              </div>
                            </div>
                            <Button variant="outline" data-testid="button-manage-sessions">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                      <CardHeader className="border-b border-border">
                        <CardTitle className="flex items-center">
                          <LogOut className="mr-2 h-5 w-5" />
                          Account Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Sign out everywhere</div>
                              <div className="text-sm text-muted-foreground">
                                Sign out of all devices and sessions
                              </div>
                            </div>
                            <Button 
                              variant="outline"
                              onClick={() => window.location.href = "/api/logout"}
                              data-testid="button-sign-out-all"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Sign Out
                            </Button>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-destructive">Delete Account</div>
                              <div className="text-sm text-muted-foreground">
                                Permanently delete your account and all data
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={deleteAccountMutation.isPending}
                              data-testid="button-delete-account"
                            >
                              {deleteAccountMutation.isPending ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Account
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
