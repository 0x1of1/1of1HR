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
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
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
              onClick={() => handleAction("/employees/add")}
            >
              <UserPlus className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Add Employee</div>
                <div className="text-xs text-gray-500">Create new employee record</div>
              </div>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/documents/new")}
          >
            <FileText className="h-5 w-5 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Upload Document</div>
              <div className="text-xs text-gray-500">Share important files</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/leave-requests/new")}
          >
            <CalendarPlus className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">Request Leave</div>
              <div className="text-xs text-gray-500">Submit time off request</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3" 
            onClick={() => handleAction("/messages/new")}
          >
            <MessageSquarePlus className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <div className="font-medium">New Message</div>
              <div className="text-xs text-gray-500">Contact team members</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}