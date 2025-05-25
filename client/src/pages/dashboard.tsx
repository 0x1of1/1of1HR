import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { PendingTasks } from "@/components/dashboard/pending-tasks";
import { TeamMembers } from "@/components/dashboard/team-members";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DepartmentTable } from "@/components/dashboard/department-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useAuth } from "@/hooks/use-auth";
import { Users, Briefcase, File, CalendarCheck, UserCheck } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  
  return (
    <MainLayout 
      title="Dashboard" 
      subtitle={`Welcome back, ${user?.firstName}. Here's what's happening today.`}
    >
      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Employees" 
          value={isManager ? "237" : "15"} 
          icon={<Users className="h-5 w-5" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          change={{ value: 2.5, isPositive: true }}
        />
        {isManager ? (
          <StatsCard 
            title="Open Positions" 
            value="12" 
            icon={<Briefcase className="h-5 w-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            change={{ value: 4.8, isPositive: true }}
          />
        ) : (
          <StatsCard 
            title="Attendance Rate" 
            value="98%" 
            icon={<UserCheck className="h-5 w-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            change={{ value: 1.2, isPositive: true }}
          />
        )}
        <StatsCard 
          title={isManager ? "Pending Reviews" : "My Reviews"} 
          value={isManager ? "28" : "2"} 
          icon={<File className="h-5 w-5" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          change={{ value: isManager ? 12.5 : 0, isPositive: !isManager }}
        />
        <StatsCard 
          title="Leave Requests" 
          value={isManager ? "15" : "1"} 
          icon={<CalendarCheck className="h-5 w-5" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          change={{ value: isManager ? 3.2 : 0, isPositive: !isManager }}
        />
      </div>
      
      {/* Quick Actions */}
      <QuickActions className="mb-6" />
      
      {/* Two-column layout for charts and tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <ActivityChart className="lg:col-span-2" />
        
        {/* Tasks and pending items */}
        <PendingTasks />
      </div>
      
      {/* Recent activity and team section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Team members */}
        <TeamMembers />
        
        {/* Recent activity */}
        <RecentActivity className="lg:col-span-2" />
      </div>
      
      {/* Department Overview - only show for managers and admins */}
      {isManager && <DepartmentTable className="mt-6" />}
    </MainLayout>
  );
}
