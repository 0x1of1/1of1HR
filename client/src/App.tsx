import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import Employees from "@/pages/employees";
import LeaveRequests from "@/pages/leave-requests";
import Messages from "@/pages/messages";
import Documents from "@/pages/documents";
import JobDescriptions from "@/pages/job-descriptions";
import PerformanceReviews from "@/pages/performance-reviews";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import UserApprovals from "@/pages/user-approvals";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/employees" component={Employees} />
      <ProtectedRoute path="/leave-requests" component={LeaveRequests} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/job-descriptions" component={JobDescriptions} />
      <ProtectedRoute path="/performance-reviews" component={PerformanceReviews} />
      <ProtectedRoute path="/user-approvals" component={UserApprovals} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
