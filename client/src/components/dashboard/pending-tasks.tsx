import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PendingTasksProps {
  className?: string;
}

type PriorityType = "High" | "Medium" | "Low" | "Urgent";

const priorityStyles: Record<PriorityType, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-blue-100 text-blue-800",
  High: "bg-amber-100 text-amber-800",
  Urgent: "bg-red-100 text-red-800"
};

// Mock tasks for initial UI
const initialTasks = [
  {
    id: 1,
    title: "Review John Smith's performance evaluation",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: "High" as PriorityType,
  },
  {
    id: 2,
    title: "Approve vacation request for Emily Chen",
    dueDate: new Date(),
    priority: "Urgent" as PriorityType,
  },
  {
    id: 3,
    title: "Update job description for Senior Developer",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: "Medium" as PriorityType,
  },
  {
    id: 4,
    title: "Sign off on new benefits package",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: "Low" as PriorityType,
  }
];

export function PendingTasks({ className }: PendingTasksProps) {
  const [visibleTasks, setVisibleTasks] = useState(4);
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/pending"],
    // Using initialTasks as placeholder until real data is fetched
    // When real implementation is ready, remove this placeholder
    placeholderData: initialTasks as unknown as Task[],
  });

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays > 1 && diffDays < 7) return `Due in ${diffDays} days`;
    if (diffDays === 7) return "Due in 1 week";
    if (diffDays > 7) return `Due in ${Math.floor(diffDays / 7)} weeks`;
    
    return "Overdue";
  };

  const handleLoadMore = () => {
    setVisibleTasks(prev => prev + 4);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Pending Tasks</CardTitle>
        <Button variant="link" size="sm" className="text-xs text-secondary-600 hover:text-secondary-700 font-medium p-0">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks?.slice(0, visibleTasks).map(task => (
            <div key={task.id} className="p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>
                <Badge className={cn("text-xs rounded-full", priorityStyles[task.priority as PriorityType])}>
                  {task.priority}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatDueDate(new Date(task.dueDate))}
              </p>
            </div>
          ))}
          
          {tasks && tasks.length > visibleTasks && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 text-sm font-medium"
              onClick={handleLoadMore}
            >
              Load more tasks
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
