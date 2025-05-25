import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JobDescription, User } from "@shared/schema";
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
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  UserCog,
  FileText,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Job description form schema
const jobDescriptionSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  title: z.string().min(1, "Job title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  responsibilities: z.string().min(1, "Responsibilities are required").max(2000),
  requirements: z.string().min(1, "Requirements are required").max(2000),
});

type JobDescriptionFormValues = z.infer<typeof jobDescriptionSchema>;

export default function JobDescriptions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<JobDescription | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "detail">("table");

  // Get job descriptions
  const { data: jobDescriptions, isLoading: descriptionsLoading } = useQuery<JobDescription[]>({
    queryKey: ["/api/job-descriptions"],
  });

  // Get employees for dropdown
  const { data: employees, isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/employees"],
  });

  // Create job description mutation
  const createJobDescriptionMutation = useMutation({
    mutationFn: async (data: JobDescriptionFormValues) => {
      if (!user) return null;
      
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId),
        createdById: user.id,
      };
      
      const res = await apiRequest("POST", "/api/job-descriptions", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-descriptions"] });
      setIsDialogOpen(false);
      toast({
        title: "Job description created",
        description: "The job description has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create job description",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update job description mutation
  const updateJobDescriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: JobDescriptionFormValues }) => {
      if (!user) return null;
      
      const payload = {
        ...data,
        employeeId: parseInt(data.employeeId),
      };
      
      const res = await apiRequest("PATCH", `/api/job-descriptions/${id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-descriptions"] });
      setIsDialogOpen(false);
      setSelectedDescription(null);
      toast({
        title: "Job description updated",
        description: "The job description has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job description",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete job description mutation
  const deleteJobDescriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-descriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-descriptions"] });
      setSelectedDescription(null);
      setViewMode("table");
      toast({
        title: "Job description deleted",
        description: "The job description has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete job description",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for job description
  const form = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: selectedDescription 
      ? {
          employeeId: selectedDescription.employeeId.toString(),
          title: selectedDescription.title,
          description: selectedDescription.description,
          responsibilities: selectedDescription.responsibilities,
          requirements: selectedDescription.requirements,
        }
      : {
          employeeId: "",
          title: "",
          description: "",
          responsibilities: "",
          requirements: "",
        },
  });

  // Reset form when dialog opens/closes or selected description changes
  React.useEffect(() => {
    if (isDialogOpen && selectedDescription) {
      form.reset({
        employeeId: selectedDescription.employeeId.toString(),
        title: selectedDescription.title,
        description: selectedDescription.description,
        responsibilities: selectedDescription.responsibilities,
        requirements: selectedDescription.requirements,
      });
    } else if (isDialogOpen) {
      form.reset({
        employeeId: "",
        title: "",
        description: "",
        responsibilities: "",
        requirements: "",
      });
    }
  }, [isDialogOpen, selectedDescription, form]);

  // Handle form submission
  const onSubmit = (data: JobDescriptionFormValues) => {
    if (selectedDescription) {
      updateJobDescriptionMutation.mutate({ id: selectedDescription.id, data });
    } else {
      createJobDescriptionMutation.mutate(data);
    }
  };

  // Get employee by ID
  const getEmployeeById = (id: number) => {
    return employees?.find(e => e.id === id);
  };

  // Handle edit click
  const handleEditClick = (description: JobDescription) => {
    setSelectedDescription(description);
    setIsDialogOpen(true);
  };

  // Handle view click
  const handleViewClick = (description: JobDescription) => {
    setSelectedDescription(description);
    setViewMode("detail");
  };

  // Filter job descriptions
  const filteredDescriptions = jobDescriptions?.filter(desc => {
    if (search) {
      const employee = getEmployeeById(desc.employeeId);
      const searchLower = search.toLowerCase();
      
      return (
        desc.title.toLowerCase().includes(searchLower) ||
        employee?.firstName.toLowerCase().includes(searchLower) ||
        employee?.lastName.toLowerCase().includes(searchLower) ||
        employee?.position.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <MainLayout title="Job Descriptions" subtitle="Manage employee job descriptions">
      {viewMode === "table" ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Job Descriptions</CardTitle>
                <CardDescription>Define and manage roles and responsibilities</CardDescription>
              </div>
              
              <Button 
                className="bg-secondary-600 hover:bg-secondary-700"
                onClick={() => {
                  setSelectedDescription(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Job Description
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search job descriptions..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {descriptionsLoading || employeesLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-border" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDescriptions?.length ? (
                    filteredDescriptions.map((description) => {
                      const employee = getEmployeeById(description.employeeId);
                      
                      return (
                        <TableRow key={description.id}>
                          <TableCell className="font-medium">{description.title}</TableCell>
                          <TableCell>{employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"}</TableCell>
                          <TableCell>{employee?.department ? employee.department.charAt(0).toUpperCase() + employee.department.slice(1) : "Unknown"}</TableCell>
                          <TableCell>{format(new Date(description.updatedAt), 'MMM d, yyyy')}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewClick(description)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClick(description)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this job description?")) {
                                    deleteJobDescriptionMutation.mutate(description.id);
                                  }
                                }} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center">
                          <UserCog className="h-12 w-12 text-slate-300 mb-4" />
                          <h3 className="font-medium text-slate-900">No job descriptions found</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {search ? "No job descriptions match your search criteria." : "Get started by creating your first job description."}
                          </p>
                          <Button 
                            className="mt-4 bg-secondary-600 hover:bg-secondary-700"
                            onClick={() => {
                              setSelectedDescription(null);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Create Job Description
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
        selectedDescription && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedDescription.title}</CardTitle>
                  <CardDescription>
                    {getEmployeeById(selectedDescription.employeeId) ? 
                      `${getEmployeeById(selectedDescription.employeeId)?.firstName} ${getEmployeeById(selectedDescription.employeeId)?.lastName} - ${getEmployeeById(selectedDescription.employeeId)?.position}` : 
                      "Unknown Employee"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(selectedDescription)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setViewMode("table")}>
                    Back to List
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                  <p className="text-slate-700 whitespace-pre-line">{selectedDescription.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <p className="text-slate-700 whitespace-pre-line">{selectedDescription.responsibilities}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="text-slate-700 whitespace-pre-line">{selectedDescription.requirements}</p>
                </div>
                
                <div className="text-sm text-slate-500">
                  <p>Last updated: {format(new Date(selectedDescription.updatedAt), 'MMMM d, yyyy')}</p>
                  <p>Created by: {getEmployeeById(selectedDescription.createdById) ? 
                    `${getEmployeeById(selectedDescription.createdById)?.firstName} ${getEmployeeById(selectedDescription.createdById)?.lastName}` : 
                    "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setViewMode("table")}
              >
                Back to Job Descriptions
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this job description?")) {
                      deleteJobDescriptionMutation.mutate(selectedDescription.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={() => handleEditClick(selectedDescription)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      )}
      
      {/* Create/Edit Job Description Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedDescription ? "Edit Job Description" : "Create New Job Description"}</DialogTitle>
            <DialogDescription>
              {selectedDescription ? "Update the job description details." : "Define a job description for an employee."}
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
                    <FormDescription>
                      Select the employee for this job description.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a general overview of the role..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the key responsibilities of this role..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Detail the specific duties and tasks for this position.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the skills, qualifications, and experience required..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Specify qualifications, skills, and experience needed for this role.
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
                  disabled={createJobDescriptionMutation.isPending || updateJobDescriptionMutation.isPending}
                >
                  {(createJobDescriptionMutation.isPending || updateJobDescriptionMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedDescription ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {selectedDescription ? "Update" : "Create"} Job Description
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
