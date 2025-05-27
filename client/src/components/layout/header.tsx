import { useState } from "react";
import { Bell, MessageSquare, HelpCircle, Menu, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-slate-200 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-slate-500 hover:text-slate-700" 
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative w-64 max-w-xs">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10" 
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-sm text-gray-500">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-black">New leave request</p>
                      <p className="text-xs text-gray-400">John Doe submitted a leave request</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-black">Performance review due</p>
                      <p className="text-xs text-gray-400">Quarterly review for Sarah Wilson</p>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full relative">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">John Doe</p>
                      <p className="text-xs text-gray-500">Meeting scheduled for tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600">SW</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">Sarah Wilson</p>
                      <p className="text-xs text-gray-500">Thanks for the feedback!</p>
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  window.history.pushState(null, "", "/messages");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="cursor-pointer"
              >
                View all messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Help */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>Contact Support</DropdownMenuItem>
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Divider */}
          <Separator orientation="vertical" className="h-8 mx-2" />
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                <span className="hidden md:inline-block">{user.firstName} {user.lastName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  window.history.pushState(null, "", "/settings");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="cursor-pointer"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  window.history.pushState(null, "", "/settings");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="cursor-pointer"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
