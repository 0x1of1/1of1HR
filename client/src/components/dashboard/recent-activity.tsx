import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FileUp, Check, Mail, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  className?: string;
}

interface Activity {
  id: number;
  type: 'document' | 'approval' | 'message' | 'onboarding';
  title: string;
  description: string;
  timestamp: Date;
}

// Mock activities for initial UI
const initialActivities = [
  {
    id: 1,
    type: 'document',
    title: 'New document uploaded',
    description: 'Emily Chen uploaded "Q3 Performance Review Template.docx"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    type: 'approval',
    title: 'Leave request approved',
    description: 'You approved John Smith\'s vacation request for June 15-22',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 3,
    type: 'message',
    title: 'New message received',
    description: 'Maria Rodriguez sent you a message about the upcoming team meeting',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'onboarding',
    title: 'New employee onboarded',
    description: 'Alex Johnson completed the onboarding process',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export function RecentActivity({ className }: RecentActivityProps) {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    // Using initialActivities as placeholder until real data is fetched
    // When real implementation is ready, remove this placeholder
    placeholderData: initialActivities,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return {
          icon: <FileUp className="h-4 w-4" />,
          bgColor: 'bg-secondary-100',
          textColor: 'text-secondary-600'
        };
      case 'approval':
        return {
          icon: <Check className="h-4 w-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        };
      case 'message':
        return {
          icon: <Mail className="h-4 w-4" />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-600'
        };
      case 'onboarding':
        return {
          icon: <UserPlus className="h-4 w-4" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600'
        };
      default:
        return {
          icon: <FileUp className="h-4 w-4" />,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-600'
        };
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue placeholder="Filter activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activities</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
            <SelectItem value="requests">Requests</SelectItem>
            <SelectItem value="messages">Messages</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
          
          <div className="space-y-6 pl-12 relative">
            {activities?.map(activity => {
              const { icon, bgColor, textColor } = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="relative">
                  <div className={cn("absolute -left-12 mt-1 w-8 h-8 rounded-full flex items-center justify-center", bgColor, textColor)}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{activity.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                    <span className="text-xs text-slate-400 mt-1 block">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              );
            })}
            
            <Button variant="link" size="sm" className="text-sm font-medium text-secondary-600 hover:text-secondary-700 p-0">
              View all activity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
