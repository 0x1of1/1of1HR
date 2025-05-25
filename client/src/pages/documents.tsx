import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Document as DocType, documentStatusEnum } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  History,
  Loader2,
} from "lucide-react";

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
  const [file, setFile] = useState<File | null>(null);
  const [uploadDetails, setUploadDetails] = useState({
    title: "",
    description: "",
    status: "draft" as typeof documentStatusEnum.enumValues[number],
  });

  // Get documents
  const { data: documents, isLoading } = useQuery<DocType[]>({
    queryKey: ["/api/documents"],
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!file || !user) return null;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadDetails.title);
      formData.append("description", uploadDetails.description);
      formData.append("status", uploadDetails.status);
      formData.append("uploadedById", user.id.toString());
      
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadDialogOpen(false);
      setFile(null);
      setUploadDetails({
        title: "",
        description: "",
        status: "draft",
      });
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
        description: "The document has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change document status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/documents/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Status updated",
        description: "The document status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    // Filter by status
    if (statusFilter !== "all" && doc.status !== statusFilter) {
      return false;
    }
    
    // Filter by file type
    if (typeFilter !== "all") {
      const fileExt = doc.fileType.toLowerCase();
      
      if (typeFilter === "pdf" && fileExt !== "pdf") return false;
      if (typeFilter === "docx" && !["docx", "doc"].includes(fileExt)) return false;
      if (typeFilter === "xlsx" && !["xlsx", "xls", "csv"].includes(fileExt)) return false;
      if (typeFilter === "pptx" && !["pptx", "ppt"].includes(fileExt)) return false;
      if (typeFilter === "image" && !["jpg", "jpeg", "png", "gif", "svg"].includes(fileExt)) return false;
    }
    
    // Filter by search term
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill title with filename if empty
      if (!uploadDetails.title) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
        setUploadDetails(prev => ({
          ...prev,
          title: fileName,
        }));
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Draft</Badge>;
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case "archived":
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Archived</Badge>;
      default:
        return null;
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type === "pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (["docx", "doc"].includes(type)) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (["xlsx", "xls", "csv"].includes(type)) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (["pptx", "ppt"].includes(type)) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    } else if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) {
      return <FileText className="h-5 w-5 text-purple-500" />;
    } else {
      return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <MainLayout title="Documents" subtitle="Manage your document library">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>Store and manage important documents</CardDescription>
            </div>
            
            <Button 
              className="bg-secondary-600 hover:bg-secondary-700"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select defaultValue="all" onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select defaultValue="all" onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-border" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments?.length ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileTypeIcon(doc.fileType)}
                          <div className="font-medium">{doc.title}</div>
                        </div>
                      </TableCell>
                      <TableCell className="uppercase">{doc.fileType}</TableCell>
                      <TableCell>User Name</TableCell>
                      <TableCell>{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>v{doc.version}</TableCell>
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
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                            
                            {doc.status !== "published" && (
                              <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ id: doc.id, status: "published" })}>
                                <Eye className="h-4 w-4 mr-2 text-green-600" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            
                            {doc.status !== "archived" && (
                              <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ id: doc.id, status: "archived" })}>
                                <History className="h-4 w-4 mr-2 text-amber-600" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this document?")) {
                                  deleteDocumentMutation.mutate(doc.id);
                                }
                              }}
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
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="font-medium text-slate-900">No documents found</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {search ? "No documents match your search criteria." : "Get started by uploading your first document."}
                        </p>
                        <Button 
                          className="mt-4 bg-secondary-600 hover:bg-secondary-700"
                          onClick={() => setUploadDialogOpen(true)}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Upload Document
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
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Upload a document to the library.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="file" className="text-sm font-medium">
                File
              </label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-xs text-slate-500">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={uploadDetails.title}
                onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                placeholder="Document title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                value={uploadDetails.description}
                onChange={(e) => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                placeholder="Brief description of the document"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select 
                defaultValue="draft"
                onValueChange={(value) => setUploadDetails({ 
                  ...uploadDetails, 
                  status: value as typeof documentStatusEnum.enumValues[number]
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => uploadDocumentMutation.mutate()}
              disabled={!file || !uploadDetails.title || uploadDocumentMutation.isPending}
              className="bg-secondary-600 hover:bg-secondary-700"
            >
              {uploadDocumentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
