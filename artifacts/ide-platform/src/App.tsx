import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/components/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayout } from '@/components/layout';
import { useGetSetupStatus } from '@workspace/api-client-react';

import Dashboard from '@/pages/dashboard';
import SetupPage from '@/pages/setup';
import LoginPage from '@/pages/login';
import NewWorkspace from '@/pages/new-workspace';
import WorkspaceIDE from '@/pages/ide';
import AdminPanel from '@/pages/admin';
import HelpPage from '@/pages/help';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { data: setupStatus, isLoading: setupLoading, isError: setupError } = useGetSetupStatus();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (setupLoading || isLoading) return;

    // Kalau API tidak bisa dihubungi (SSL belum siap, dll), arahkan ke /setup
    // supaya admin bisa buat akun pertama
    if (setupError && location !== '/setup' && location !== '/login') {
      setLocation('/setup');
      return;
    }

    if (setupStatus?.needsSetup && location !== '/setup') {
      setLocation('/setup');
      return;
    }

    if (setupStatus?.needsSetup === false && location === '/setup') {
      setLocation('/login');
      return;
    }

    if (setupStatus?.needsSetup === false && !user && location !== '/login') {
      setLocation('/login');
      return;
    }
    
    if (user && (location === '/login' || location === '/setup')) {
      setLocation('/');
      return;
    }

  }, [user, isLoading, setupStatus, setupLoading, setupError, location, setLocation]);

  if (isLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If we are on public routes and not logged in, render them directly
  if (location === '/setup' || location === '/login') {
    return <>{children}</>;
  }

  // If on IDE route, render directly without AppLayout (IDE has its own layout)
  if (location.startsWith('/workspaces/') && location !== '/workspaces/new') {
    return <>{children}</>;
  }

  // Wrap all other protected routes in AppLayout
  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/setup" component={SetupPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/" component={Dashboard} />
        <Route path="/workspaces/new" component={NewWorkspace} />
        <Route path="/workspaces/:id" component={WorkspaceIDE} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/help" component={HelpPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ide-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
