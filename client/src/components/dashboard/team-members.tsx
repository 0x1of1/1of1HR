import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TeamMembersProps {
  className?: string;
}

// Mock team members for initial UI
const initialTeamMembers = [
  {
    id: 1,
    firstName: "Emily",
    lastName: "Chen",
    position: "UI/UX Designer",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
    status: "online"
  },
  {
    id: 2,
    firstName: "John",
    lastName: "Smith",
    position: "Senior Developer",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
    status: "offline"
  },
  {
    id: 3,
    firstName: "Maria",
    lastName: "Rodriguez",
    position: "Product Manager",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
    status: "away"
  },
  {
    id: 4,
    firstName: "Alex",
    lastName: "Johnson",
    position: "Marketing Specialist",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48",
    status: "online"
  }
];

export function TeamMembers({ className }: TeamMembersProps) {
  const { data: teamMembers, isLoading } = useQuery<(User & { status: string })[]>({
    queryKey: ["/api/team-members"],
    // Using initialTeamMembers as placeholder until real data is fetched
    // When real implementation is ready, remove this placeholder
    placeholderData: initialTeamMembers as unknown as (User & { status: string })[],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "offline":
        return "bg-error";
      case "away":
        return "bg-warning";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Team Members</CardTitle>
        <Button variant="link" size="sm" className="text-xs text-secondary-600 hover:text-secondary-700 font-medium p-0">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers?.map(member => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
                  <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-slate-900">{member.firstName} {member.lastName}</h4>
                  <p className="text-xs text-slate-500">{member.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("inline-block w-2 h-2 rounded-full", getStatusColor(member.status))}></span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-secondary-600">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
