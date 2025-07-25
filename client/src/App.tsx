import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import InteractiveDashboard from "@/pages/interactive-dashboard";
import ClientPageOrkut from "@/pages/client-page-orkut";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public client pages - no auth required */}
      <Route path="/client/:vendorId" component={ClientPageOrkut} />
      
      {/* Login page */}
      <Route path="/login" component={Login} />
      
      {/* Authenticated routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={InteractiveDashboard} />
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
