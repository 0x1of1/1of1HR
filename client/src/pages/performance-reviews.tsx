import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PerformanceReview, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Medal,
  ClipboardList,
  Star,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Performance review form schema
const performanceReviewSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  reviewPeriod: z.string().min(1, "Review period is required"),
  content: z.string().min(1, "Review content is required").max(5000),
  rating: z.string().min(1, "Rating is required"),
  goals: z.string().min(1, "Goals are required").max(2000),
  status: z.string().min(1, "Status is required"),
});

type PerformanceReviewFormValues = z.infer<typeof performanceReviewSchema>;

export default function PerformanceReviews() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "detail">("table");

  // Get performance reviews
  const { data: performanceReviews, isLoading: reviewsLoading } = useQuery<PerformanceReview[]>({
    queryKey: ["/api/performance-reviews"],
  });

  // Get employees for dropdown
  const { data: employees, isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  // Create performance review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: PerformanceReviewFormValues) => {
      if (!user) return null;
      
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId),
        reviewerId: user.id,
        rating: parseInt(data.rating),
      };
      
      const res = await apiRequest("POST", "/api/performance-reviews", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-reviews"] });
      setIsDialogOpen(false);
      toast({
        title: "Performance review created",
        description: "The performance review has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update performance review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PerformanceReviewFormValues }) => {
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId),
        rating: parseInt(data.rating),
      };
      
      const res = await apiRequest("PATCH", `/api/performance-reviews/${id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-reviews"] });
      setIsDialogOpen(false);
      setSelectedReview(null);
      toast({
        title: "Performance review updated",
        description: "The performance review has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete performance review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/performance-reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-reviews"] });
      setSelectedReview(null);
      setViewMode("table");
      toast({
        title: "Performance review deleted",
        description: "The performance review has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for performance review
  const form = useForm<PerformanceReviewFormValues>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: selectedReview 
      ? {
          employeeId: selectedReview.employeeId.toString(),
          reviewPeriod: selectedReview.reviewPeriod,
          content: selectedReview.content,
          rating: selectedReview.rating.toString(),
          goals: selectedReview.goals,
          status: selectedReview.status,
        }
      : {
          employeeId: "",
          reviewPeriod: "",
          content: "",
          rating: "3",
          goals: "",
          status: "draft",
        },
  });

  // Reset form when dialog opens/closes or selected review changes
  React.useEffect(() => {
    if (isDialogOpen && selectedReview) {
      form.reset({
        employeeId: selectedReview.employeeId.toString(),
        reviewPeriod: selectedReview.reviewPeriod,
        content: selectedReview.content,
        rating: selectedReview.rating.toString(),
        goals: selectedReview.goals,
        status: selectedReview.status,
      });
    } else if (isDialogOpen) {
      form.reset({
        employeeId: "",
        reviewPeriod: "",
        content: "",
        rating: "3",
        goals: "",
        status: "draft",
      });
    }
  }, [isDialogOpen, selectedReview, form]);

  // Handle form submission
  const onSubmit = (data: PerformanceReviewFormValues) => {
    if (selectedReview) {
      updateReviewMutation.mutate({ id: selectedReview.id, data });
    } else {
      createReviewMutation.mutate(data);
    }
  };

  // Get employee by ID
  const getEmployeeById = (id: number) => {
    return employees?.find(e => e.id === id);
  };

  // Handle edit click
  const handleEditClick = (review: PerformanceReview) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  // Handle view click
  const handleViewClick = (review: PerformanceReview) => {
    setSelectedReview(review);
    setViewMode("detail");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case "acknowledged":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Acknowledged</Badge>;
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get rating stars
  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  // Filter performance reviews
  const filteredReviews = performanceReviews?.filter(review => {
    // Filter by tab
    if (activeTab !== "all" && review.status !== activeTab) {
      return false;
    }
    
    // Filter by search
    if (search) {
      const employee = getEmployeeById(review.employeeId);
      const reviewer = getEmployeeById(review.reviewerId);
      const searchLower = search.toLowerCase();
      
      return (
        review.reviewPeriod.toLowerCase().includes(searchLower) ||
        (employee && (`${employee.firstName} ${employee.lastName}`).toLowerCase().includes(searchLower)) ||
        (reviewer && (`${reviewer.firstName} ${reviewer.lastName}`).toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  return (
    <MainLayout title="Performance Reviews" subtitle="Manage employee performance evaluations">
      {viewMode === "table" ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Track and manage employee evaluations</CardDescription>
              </div>
              
              <Button 
                className="bg-secondary-600 hover:bg-secondary-700"
                onClick={() => {
                  setSelectedReview(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Review
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Reviews</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search reviews..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </Tabs>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Review Period</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewsLoading || employeesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-border" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReviews?.length ? (
                    filteredReviews.map((review) => {
                      const employee = getEmployeeById(review.employeeId);
                      const reviewer = getEmployeeById(review.reviewerId);
                      
                      return (
                        <TableRow key={review.id}>
                          <TableCell>
                            {employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"}
                          </TableCell>
                          <TableCell>{review.reviewPeriod}</TableCell>
                          <TableCell>{getRatingStars(review.rating)}</TableCell>
                          <TableCell>
                            {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Unknown"}
                          </TableCell>
                          <TableCell>{getStatusBadge(review.status)}</TableCell>
                          <TableCell>{format(new Date(review.updatedAt), 'MMM d, yyyy')}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewClick(review)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {review.status === "draft" && (
                                  <DropdownMenuItem onClick={() => handleEditClick(review)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {review.status === "draft" && (
                                  <DropdownMenuItem onClick={() => updateReviewMutation.mutate({
                                    id: review.id,
                                    data: {
                                      ...form.getValues(),
                                      employeeId: review.employeeId.toString(),
                                      reviewPeriod: review.reviewPeriod,
                                      content: review.content,
                                      rating: review.rating.toString(),
                                      goals: review.goals,
                                      status: "published",
                                    }
                                  })}>
                                    <ClipboardList className="h-4 w-4 mr-2 text-green-600" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                {review.status === "draft" && (
                                  <DropdownMenuSeparator />
                                )}
                                {review.status === "draft" && (
                                  <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to delete this performance review?")) {
                                        deleteReviewMutation.mutate(review.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center">
                          <Medal className="h-12 w-12 text-slate-300 mb-4" />
                          <h3 className="font-medium text-slate-900">No performance reviews found</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {search ? "No reviews match your search criteria." : "Get started by creating your first performance review."}
                          </p>
                          <Button 
                            className="mt-4 bg-secondary-600 hover:bg-secondary-700"
                            onClick={() => {
                              setSelectedReview(null);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Create Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        selectedReview && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Performance Review</CardTitle>
                  <CardDescription>
                    {getEmployeeById(selectedReview.employeeId) ? 
                      `${getEmployeeById(selectedReview.employeeId)?.firstName} ${getEmployeeById(selectedReview.employeeId)?.lastName} - ${selectedReview.reviewPeriod}` : 
                      `Unknown Employee - ${selectedReview.reviewPeriod}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedReview.status === "draft" && (
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(selectedReview)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setViewMode("table")}>
                    Back to List
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Rating</p>
                    <div className="flex items-center">
                      {getRatingStars(selectedReview.rating)}
                      <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Review Content</h3>
                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-slate-700 whitespace-pre-line">{selectedReview.content}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Goals and Objectives</h3>
                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-slate-700 whitespace-pre-line">{selectedReview.goals}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Employee</p>
                    <p className="text-slate-700">
                      {getEmployeeById(selectedReview.employeeId) ? 
                        `${getEmployeeById(selectedReview.employeeId)?.firstName} ${getEmployeeById(selectedReview.employeeId)?.lastName}` : 
                        "Unknown Employee"}
                    </p>
                    <p className="text-slate-500">
                      {getEmployeeById(selectedReview.employeeId)?.position || ""}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Reviewer</p>
                    <p className="text-slate-700">
                      {getEmployeeById(selectedReview.reviewerId) ? 
                        `${getEmployeeById(selectedReview.reviewerId)?.firstName} ${getEmployeeById(selectedReview.reviewerId)?.lastName}` : 
                        "Unknown Reviewer"}
                    </p>
                    <p className="text-slate-500">
                      {getEmployeeById(selectedReview.reviewerId)?.position || ""}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500">
                  <p>Created: {format(new Date(selectedReview.createdAt), 'MMMM d, yyyy')}</p>
                  <p>Last updated: {format(new Date(selectedReview.updatedAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setViewMode("table")}
              >
                Back to Reviews
              </Button>
              
              {selectedReview.status === "draft" && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this performance review?")) {
                        deleteReviewMutation.mutate(selectedReview.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button 
                    onClick={() => updateReviewMutation.mutate({
                      id: selectedReview.id,
                      data: {
                        ...form.getValues(),
                        employeeId: selectedReview.employeeId.toString(),
                        reviewPeriod: selectedReview.reviewPeriod,
                        content: selectedReview.content,
                        rating: selectedReview.rating.toString(),
                        goals: selectedReview.goals,
                        status: "published",
                      }
                    })}
                    className="bg-secondary-600 hover:bg-secondary-700"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Publish Review
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        )
      )}
      
      {/* Create/Edit Performance Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedReview ? "Edit Performance Review" : "Create New Performance Review"}</DialogTitle>
            <DialogDescription>
              {selectedReview ? "Update the performance review details." : "Create a new performance evaluation for an employee."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees?.map(employee => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.firstName} {employee.lastName} ({employee.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reviewPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Period</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Q2 2023" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the time period this review covers (e.g., Q1 2023, Jan-Jun 2023).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed feedback on the employee's performance..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Needs Significant Improvement</SelectItem>
                        <SelectItem value="2">2 - Below Expectations</SelectItem>
                        <SelectItem value="3">3 - Meets Expectations</SelectItem>
                        <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                        <SelectItem value="5">5 - Outstanding Performance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals and Objectives</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List specific goals and objectives for the employee..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Define clear, measurable goals for the next review period.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the current status of this performance review.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-secondary-600 hover:bg-secondary-700"
                  disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                >
                  {(createReviewMutation.isPending || updateReviewMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedReview ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {selectedReview ? "Update" : "Create"} Performance Review
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
