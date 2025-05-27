import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Document as DocType, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  MoreHorizontal,
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";

// Form schema for document upload
const documentFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

// Define document types for filtering
const DOCUMENT_TYPES = [
  { value: "all", label: "All Documents" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "Word" },
  { value: "xlsx", label: "Excel" },
  { value: "pptx", label: "PowerPoint" },
  { value: "image", label: "Images" },
];

export default function Documents() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery<DocType[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch users for uploader names
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Form for document upload
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormValues & { file: File }) => {
      if (!user) throw new Error("User not authenticated");
      
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("status", data.status);
      formData.append("uploadedById", user.id.toString());

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadDialogOpen(false);
      form.reset();
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been deleted.",
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

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    // Search filter
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && doc.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== "all") {
      const fileExt = doc.fileType.toLowerCase();
      if (typeFilter === "pdf" && !fileExt.includes("pdf")) return false;
      if (typeFilter === "docx" && !fileExt.includes("word")) return false;
      if (typeFilter === "xlsx" && !fileExt.includes("excel")) return false;
      if (typeFilter === "image" && !fileExt.includes("image")) return false;
    }
    
    return true;
  });

  // Get uploader name
  const getUploaderName = (uploadedById: number) => {
    const uploader = users?.find(u => u.id === uploadedById);
    return uploader ? `${uploader.firstName} ${uploader.lastName}` : "Unknown";
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("excel")) return "📊";
    if (fileType.includes("powerpoint")) return "📈";
    if (fileType.includes("image")) return "🖼️";
    return "📄";
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("title", file.name.split(".")[0]);
    }
  };

  // Handle form submission
  const onSubmit = (data: DocumentFormValues) => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate({ ...data, file });
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  return (
    <MainLayout title="Documents" subtitle="Manage and organize company documents">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Document Management</h2>
              <p className="text-sm text-slate-600">Upload, organize and manage company documents</p>
            </div>
            
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary-600 hover:bg-secondary-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document to the system
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">File</label>
                        <Input
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                          required
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Document title" {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional description" {...field} />
                            </FormControl>
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
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploadDocumentMutation.isPending}>
                          {uploadDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Upload
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : filteredDocuments?.length ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getFileIcon(doc.fileType)}</span>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.description && (
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{doc.fileType}</span>
                    </TableCell>
                    <TableCell>{getUploaderName(doc.uploadedById)}</TableCell>
                    <TableCell>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
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
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No documents found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      Upload First Document
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