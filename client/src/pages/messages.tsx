import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Message, User, InsertMessage } from "@shared/schema";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MoreHorizontal,
  Plus,
  Search,
  Send,
  MessageCircle,
  Loader2,
  Inbox,
  Send as SendIcon,
  Archive,
  Trash2,
} from "lucide-react";

// Form schema for new message
const newMessageSchema = z.object({
  receiverId: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  content: z.string().min(1, "Message content is required").max(5000, "Message is too long"),
});

type NewMessageFormValues = z.infer<typeof newMessageSchema>;

export default function Messages() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Get all messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Get all users for recipient selection
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsComposeOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
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

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${id}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setSelectedMessage(null);
      toast({
        title: "Message deleted",
        description: "The message has been deleted.",
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

  // Form for new message
  const form = useForm<NewMessageFormValues>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: {
      receiverId: "",
      subject: "",
      content: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: NewMessageFormValues) => {
    if (!user) return;
    
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: parseInt(data.receiverId),
      subject: data.subject,
      content: data.content,
    });
  };

  // Filter messages based on active folder and search
  const filteredMessages = messages?.filter(message => {
    // Filter by folder
    if (activeFolder === "inbox" && message.receiverId !== user?.id) return false;
    if (activeFolder === "sent" && message.senderId !== user?.id) return false;
    
    // Filter by search term
    if (search && !message.subject.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get selected message details
  const selectedMessageData = selectedMessage 
    ? messages?.find(m => m.id === selectedMessage) 
    : null;

  // Get user details by ID
  const getUserById = (id: number) => {
    return users?.find(u => u.id === id);
  };

  // Handle message selection
  const handleSelectMessage = (id: number) => {
    setSelectedMessage(id);
    const message = messages?.find(m => m.id === id);
    if (message && message.status === "unread" && message.receiverId === user?.id) {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <MainLayout title="Messages" subtitle="Communicate with team members">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Messages</CardTitle>
              <CardDescription>Manage your communications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full mb-4 bg-secondary-600 hover:bg-secondary-700"
                onClick={() => setIsComposeOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Compose New
              </Button>
              
              <div className="space-y-1">
                <Button
                  variant={activeFolder === "inbox" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveFolder("inbox");
                    setSelectedMessage(null);
                  }}
                >
                  <Inbox className="mr-2 h-4 w-4" />
                  Inbox
                  <span className="ml-auto bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">
                    {messages?.filter(m => m.receiverId === user?.id && m.status === "unread").length || 0}
                  </span>
                </Button>
                <Button
                  variant={activeFolder === "sent" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveFolder("sent");
                    setSelectedMessage(null);
                  }}
                >
                  <SendIcon className="mr-2 h-4 w-4" />
                  Sent
                </Button>
                <Button
                  variant={activeFolder === "archived" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archived
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Messages List */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <CardTitle>{activeFolder === "inbox" ? "Inbox" : "Sent Messages"}</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <div className="flex h-[calc(100%-80px)]">
              {/* Message List */}
              <div className={`w-full ${selectedMessage ? 'hidden md:block md:w-1/3' : 'w-full'} border-r`}>
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-border" />
                  </div>
                ) : filteredMessages?.length ? (
                  <div className="overflow-y-auto max-h-[600px]">
                    {filteredMessages.map((message) => {
                      const isUnread = message.status === "unread" && message.receiverId === user?.id;
                      const sender = getUserById(message.senderId);
                      const receiver = getUserById(message.receiverId);
                      
                      return (
                        <div
                          key={message.id}
                          className={`
                            p-4 border-b cursor-pointer
                            ${isUnread ? 'bg-slate-50' : ''}
                            ${selectedMessage === message.id ? 'bg-slate-100' : ''}
                            hover:bg-slate-50
                          `}
                          onClick={() => handleSelectMessage(message.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={activeFolder === "inbox" 
                                  ? sender?.avatarUrl || "" 
                                  : receiver?.avatarUrl || ""} 
                              />
                              <AvatarFallback>
                                {activeFolder === "inbox" 
                                  ? `${sender?.firstName?.[0] || ""}${sender?.lastName?.[0] || ""}` 
                                  : `${receiver?.firstName?.[0] || ""}${receiver?.lastName?.[0] || ""}`}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className={`font-medium truncate ${isUnread ? 'text-black' : 'text-slate-700'}`}>
                                  {activeFolder === "inbox" 
                                    ? `${sender?.firstName} ${sender?.lastName}` 
                                    : `${receiver?.firstName} ${receiver?.lastName}`}
                                </p>
                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                  {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className={`text-sm truncate ${isUnread ? 'font-medium' : 'text-slate-700'}`}>
                                {message.subject}
                              </p>
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {message.content.substring(0, 100)}
                                {message.content.length > 100 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                    <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="font-medium text-slate-900">No messages found</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {activeFolder === "inbox" 
                        ? "Your inbox is empty" 
                        : "You haven't sent any messages yet"}
                    </p>
                    <Button 
                      className="mt-4 bg-secondary-600 hover:bg-secondary-700"
                      onClick={() => setIsComposeOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Compose New
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Message Detail */}
              {selectedMessage && selectedMessageData && (
                <div className={`${selectedMessage ? 'w-full md:w-2/3' : 'hidden'} p-6`}>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold">{selectedMessageData.subject}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsComposeOpen(true)}>
                        <SendIcon className="h-4 w-4 mr-2" /> Reply
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this message?")) {
                            deleteMessageMutation.mutate(selectedMessageData.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={getUserById(selectedMessageData.senderId)?.avatarUrl || ""} 
                      />
                      <AvatarFallback>
                        {getUserById(selectedMessageData.senderId)?.firstName?.[0] || ""}
                        {getUserById(selectedMessageData.senderId)?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getUserById(selectedMessageData.senderId)?.firstName || ""} {getUserById(selectedMessageData.senderId)?.lastName || ""}
                      </p>
                      <div className="flex items-center text-sm text-slate-500">
                        <span>To: {getUserById(selectedMessageData.receiverId)?.firstName || ""} {getUserById(selectedMessageData.receiverId)?.lastName || ""}</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(selectedMessageData.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-md">
                    <p className="text-slate-800 whitespace-pre-line">{selectedMessageData.content}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Compose New Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Send a message to a team member.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.filter(u => u.id !== user?.id).map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id.toString()}>
                            {recipient.firstName} {recipient.lastName} ({recipient.position})
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Message subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-secondary-600 hover:bg-secondary-700"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
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
