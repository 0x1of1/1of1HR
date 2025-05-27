import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, FileText, UserPlus, CalendarPlus, MessageSquarePlus } from "lucide-react";
import { Link, useLocation } from "wouter";

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  
  const handleAction = (path: string) => {
    setLocation(path);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-black text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {isManager && (
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2 h-auto py-3" 
              onClick={() => handleAction("/employees")}
            >
              <UserPlus className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Manage Employees</div>
                <div className="text-xs text-gray-500">View and manage team</div>
              </div>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/documents")}
          >
            <FileText className="h-5 w-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Documents</div>
              <div className="text-xs text-gray-500">Upload and view files</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/leave-requests")}
          >
            <CalendarPlus className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">Leave Requests</div>
              <div className="text-xs text-gray-500">Submit and track time off</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/messages")}
          >
            <MessageSquarePlus className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <div className="font-medium">Messages</div>
              <div className="text-xs text-gray-500">Communication center</div>
            </div>
          </Button>

          {!isManager && (
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2 h-auto py-3" 
              onClick={() => handleAction("/job-descriptions")}
            >
              <PlusCircle className="h-5 w-5 text-indigo-500" />
              <div className="text-left">
                <div className="font-medium">Job Descriptions</div>
                <div className="text-xs text-gray-500">View role details</div>
              </div>
            </Button>
          )}

          {isManager && (
            <Button 
              variant="outline" 
              className="flex items-center justify-start gap-2 h-auto py-3" 
              onClick={() => handleAction("/user-approvals")}
            >
              <UserPlus className="h-5 w-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium">User Approvals</div>
                <div className="text-xs text-gray-500">Review pending users</div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}