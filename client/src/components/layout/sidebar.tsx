import { Building, ChevronDown, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  FileBarChart2, 
  BarChart2, 
  Settings,
  CalendarCheck,
  Medal,
  UserCog
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const isManager = user.role === 'manager';
  const isAdmin = user.role === 'admin';

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/employees", label: "Employees", icon: <Users className="h-5 w-5" /> },
    { href: "/leave-requests", label: "Leave Requests", icon: <CalendarCheck className="h-5 w-5" /> },
    { href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
    { href: "/reports", label: "Reports", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const managerTools = [
    { href: "/job-descriptions", label: "Job Descriptions", icon: <UserCog className="h-5 w-5" /> },
    { href: "/performance-reviews", label: "Performance Reviews", icon: <Medal className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen">
      <div className="flex flex-col h-full">
        {/* Logo and header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-accent-500" />
            <h1 className="text-xl font-bold">HR System</h1>
          </div>
          {isMobile && (
            <button 
              className="lg:hidden text-slate-400 hover:text-white" 
              onClick={onClose}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* User profile */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
          <div className="relative">
            <Avatar>
              <AvatarImage src={user.avatarUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-primary-900"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-400 truncate">{user.position}</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location === item.href
                        ? "bg-secondary-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.label === "Messages" && (
                      <span className="ml-auto bg-accent-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        3
                      </span>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Manager tools section */}
          {(isManager || isAdmin) && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Manager Tools
              </h3>
              <ul className="mt-2 space-y-1">
                {managerTools.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          location === item.href
                            ? "bg-secondary-500 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
        
        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t border-slate-700">
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
