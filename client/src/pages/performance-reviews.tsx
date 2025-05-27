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
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Star,
  Loader2,
  ClipboardList,
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

// Form schema for performance reviews
const reviewFormSchema = z.object({
  employeeId: z.number().min(1, "Employee selection is required"),
  reviewPeriod: z.string().min(1, "Review period is required"),
  content: z.string().min(10, "Review content must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  goals: z.string().min(5, "Goals must be at least 5 characters"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function PerformanceReviews() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch performance reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<PerformanceReview[]>({
    queryKey: ["/api/performance-reviews"],
  });

  // Fetch all users for employee selection
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Form for creating performance reviews
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      employeeId: 0,
      reviewPeriod: "",
      content: "",
      rating: 3,
      goals: "",
    },
  });

  // Create performance review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const res = await apiRequest("POST", "/api/performance-reviews", {
        ...data,
        reviewerId: user.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-reviews"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Review created",
        description: "Performance review has been created successfully.",
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

  // Filter reviews based on search
  const filteredReviews = reviews?.filter(review => {
    if (!search) return true;
    const employee = users?.find(u => u.id === review.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "";
    return (
      employeeName.toLowerCase().includes(search.toLowerCase()) ||
      review.reviewPeriod.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Get employee name
  const getEmployeeName = (employeeId: number) => {
    const employee = users?.find(u => u.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  // Get reviewer name
  const getReviewerName = (reviewerId: number) => {
    const reviewer = users?.find(u => u.id === reviewerId);
    return reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Unknown";
  };

  // Get rating stars
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Handle form submission
  const onSubmit = (data: ReviewFormValues) => {
    createReviewMutation.mutate(data);
  };

  return (
    <MainLayout title="Performance Reviews" subtitle="Manage employee performance evaluations">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Performance Reviews</h2>
              <p className="text-sm text-slate-600">Track and manage employee performance evaluations</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary-600 hover:bg-secondary-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Performance Review</DialogTitle>
                    <DialogDescription>
                      Create a new performance review for an employee.
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
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users?.filter(u => u.role === 'employee').map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.firstName} {user.lastName}
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
                              <Input placeholder="e.g., Q1 2024, Annual 2024" {...field} />
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
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - Needs Improvement</SelectItem>
                                <SelectItem value="2">2 - Below Expectations</SelectItem>
                                <SelectItem value="3">3 - Meets Expectations</SelectItem>
                                <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                                <SelectItem value="5">5 - Outstanding</SelectItem>
                              </SelectContent>
                            </Select>
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
                                placeholder="Provide detailed feedback on performance, achievements, and areas for improvement..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="goals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goals for Next Period</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Set goals and objectives for the next review period..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createReviewMutation.isPending}>
                          {createReviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Review
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Review Period</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading performance reviews...
                  </TableCell>
                </TableRow>
              ) : filteredReviews?.length ? (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="font-medium">{getEmployeeName(review.employeeId)}</div>
                    </TableCell>
                    <TableCell>{review.reviewPeriod}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingStars(review.rating)}
                        <span className="ml-2 text-sm text-slate-600">({review.rating}/5)</span>
                      </div>
                    </TableCell>
                    <TableCell>{getReviewerName(review.reviewerId)}</TableCell>
                    <TableCell>{format(new Date(review.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className={review.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {review.status}
                      </Badge>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Review
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No performance reviews found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create First Review
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}