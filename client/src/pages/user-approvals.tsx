import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Mail, Phone, Building2, Calendar, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'employee' | 'manager';
  department: string;
  position: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  startDate?: string;
  registrationMessage?: string;
  createdAt: string;
}

export default function UserApprovalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: pendingUsers, isLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/pending-users"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/approve-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-users"] });
      toast({
        title: "User Approved",
        description: "The user has been successfully approved and can now access the system.",
      });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/reject-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-users"] });
      toast({
        title: "Registration Rejected",
        description: "The user registration has been rejected.",
      });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessingId(null);
    },
  });

  const handleApprove = (userId: number) => {
    setProcessingId(userId);
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: number) => {
    setProcessingId(userId);
    rejectMutation.mutate(userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      engineering: "bg-blue-100 text-blue-800",
      marketing: "bg-green-100 text-green-800",
      sales: "bg-purple-100 text-purple-800",
      hr: "bg-pink-100 text-pink-800",
      finance: "bg-yellow-100 text-yellow-800",
      product: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[department as keyof typeof colors] || colors.other;
  };

  const getRoleColor = (role: string) => {
    return role === 'manager' 
      ? "bg-orange-100 text-orange-800 border-orange-200" 
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending registrations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Approvals</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve pending user registrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {pendingUsers?.length || 0} pending approvals
          </span>
        </div>
      </div>

      {!pendingUsers || pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
            <p className="text-muted-foreground">
              All user registrations have been processed. New registration requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-orange-400">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant="outline" className={getDepartmentColor(user.department)}>
                        <Building2 className="h-3 w-3 mr-1" />
                        {user.department}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApprove(user.id)}
                      disabled={processingId === user.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(user.id)}
                      disabled={processingId === user.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Applied on {formatDate(user.createdAt)} • {user.position}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    {user.startDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Start Date: {formatDate(user.startDate)}</span>
                      </div>
                    )}
                  </div>

                  {(user.emergencyContact || user.emergencyPhone) && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Emergency Contact</h4>
                      {user.emergencyContact && (
                        <div className="text-sm">{user.emergencyContact}</div>
                      )}
                      {user.emergencyPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.emergencyPhone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {user.registrationMessage && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Registration Message</h4>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {user.registrationMessage}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}