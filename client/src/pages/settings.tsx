import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { BellRing, HelpCircle, Mail, Shield, User } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [personalData, setPersonalData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "555-123-4567", // Example data
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    leaveRequestAlerts: true,
    documentAlerts: true,
    taskAlerts: true,
  });

  const handlePersonalDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };

  return (
    <MainLayout title="Settings">
      <div className="space-y-4 p-8">
        <h1 className="text-2xl font-bold tracking-tight text-black">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="text-black">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-black">
              <BellRing className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="text-black">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="help" className="text-black">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Profile Information</CardTitle>
                <CardDescription>Update your personal information here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-black">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={personalData.firstName}
                        onChange={handlePersonalDataChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-black">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={personalData.lastName}
                        onChange={handlePersonalDataChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-black">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={personalData.email}
                        onChange={handlePersonalDataChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-black">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={personalData.phone}
                        onChange={handlePersonalDataChange}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Notification Preferences</CardTitle>
                <CardDescription>Control how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-black">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notifications.emailAlerts}
                      onCheckedChange={() => handleNotificationChange('emailAlerts')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-black">Leave Request Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about leave request updates</p>
                    </div>
                    <Switch 
                      checked={notifications.leaveRequestAlerts}
                      onCheckedChange={() => handleNotificationChange('leaveRequestAlerts')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-black">Document Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when documents are shared with you</p>
                    </div>
                    <Switch 
                      checked={notifications.documentAlerts}
                      onCheckedChange={() => handleNotificationChange('documentAlerts')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-black">Task Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about task assignments and deadlines</p>
                    </div>
                    <Switch 
                      checked={notifications.taskAlerts}
                      onCheckedChange={() => handleNotificationChange('taskAlerts')}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="bg-blue-500 text-white hover:bg-blue-600">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Security Settings</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-black">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-black">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-black">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-black">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="bg-blue-500 text-white hover:bg-blue-600">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Help & Support */}
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Help & Support</CardTitle>
                <CardDescription>Get help or contact support.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-black mb-2">Frequently Asked Questions</h3>
                    <ul className="space-y-3">
                      <li>
                        <button className="text-left w-full text-black font-medium hover:text-blue-500">
                          How do I request time off?
                        </button>
                      </li>
                      <li>
                        <button className="text-left w-full text-black font-medium hover:text-blue-500">
                          How do I update my personal information?
                        </button>
                      </li>
                      <li>
                        <button className="text-left w-full text-black font-medium hover:text-blue-500">
                          How do I view my benefits information?
                        </button>
                      </li>
                      <li>
                        <button className="text-left w-full text-black font-medium hover:text-blue-500">
                          How do I reset my password?
                        </button>
                      </li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium text-black mb-4">Contact Support</h3>
                    <div className="flex space-x-4">
                      <Button className="flex items-center bg-blue-500 text-white hover:bg-blue-600">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </Button>
                      <Button variant="outline" className="text-black">
                        View Knowledge Base
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}