import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LeaveRequest } from "@shared/schema";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Check, 
  X, 
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaveRequests() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: leaveRequests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note?: string }) => {
      await apiRequest("PATCH", `/api/leave-requests/${id}/approve`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Request approved",
        description: "The leave request has been approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      await apiRequest("PATCH", `/api/leave-requests/${id}/reject`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Request rejected",
        description: "The leave request has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRequests = leaveRequests?.filter((request) => {
    // Apply status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter (implementation would depend on what fields you want to search)
    if (search && !request.reason.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Leave Requests" subtitle="Manage employee leave requests">
      <Tabs defaultValue="all">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64 max-w-sm">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-secondary-600 hover:bg-secondary-700">
                    <Plus className="h-4 w-4 mr-1" /> New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                      Submit a new leave request for approval.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Leave request form fields would go here */}
                    <p className="text-sm text-slate-500">
                      Leave request form implementation will go here.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="all" className="p-0 m-0">
            <LeaveRequestsTable 
              leaveRequests={filteredRequests} 
              isLoading={isLoading}
              approveRequest={approveRequestMutation.mutate}
              rejectRequest={rejectRequestMutation.mutate}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="p-0 m-0">
            <LeaveRequestsTable 
              leaveRequests={leaveRequests?.filter(r => r.status === 'pending')} 
              isLoading={isLoading}
              approveRequest={approveRequestMutation.mutate}
              rejectRequest={rejectRequestMutation.mutate}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="approved" className="p-0 m-0">
            <LeaveRequestsTable 
              leaveRequests={leaveRequests?.filter(r => r.status === 'approved')} 
              isLoading={isLoading}
              approveRequest={approveRequestMutation.mutate}
              rejectRequest={rejectRequestMutation.mutate}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="p-0 m-0">
            <LeaveRequestsTable 
              leaveRequests={leaveRequests?.filter(r => r.status === 'rejected')} 
              isLoading={isLoading}
              approveRequest={approveRequestMutation.mutate}
              rejectRequest={rejectRequestMutation.mutate}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </div>
      </Tabs>
    </MainLayout>
  );
}

interface LeaveRequestsTableProps {
  leaveRequests?: LeaveRequest[];
  isLoading: boolean;
  approveRequest: ({ id, note }: { id: number; note?: string }) => void;
  rejectRequest: ({ id, note }: { id: number; note: string }) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

function LeaveRequestsTable({ 
  leaveRequests, 
  isLoading,
  approveRequest,
  rejectRequest,
  getStatusBadge
}: LeaveRequestsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Leave Period</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Loading leave requests...
              </TableCell>
            </TableRow>
          ) : leaveRequests?.length ? (
            leaveRequests.map((request) => {
              // Calculate duration in days
              const start = new Date(request.startDate);
              const end = new Date(request.endDate);
              const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <TableRow key={request.id}>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{durationDays} days</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {request.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => approveRequest({ id: request.id })}>
                              <Check className="h-4 w-4 mr-2 text-success" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => rejectRequest({ id: request.id, note: "Request rejected" })}>
                              <X className="h-4 w-4 mr-2 text-destructive" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                No leave requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
