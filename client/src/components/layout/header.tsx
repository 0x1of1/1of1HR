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
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent-500 rounded-full"></span>
            </Button>
          </div>
          
          {/* Messages */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent-500 rounded-full"></span>
            </Button>
          </div>
          
          {/* Help */}
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 rounded-full">
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          {/* Divider */}
          <Separator orientation="vertical" className="h-8 mx-2" />
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-secondary-600">
                <span className="hidden md:inline-block">{user.firstName} {user.lastName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
