import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@workspace/api-client-react";
import { Code2, LayoutDashboard, Settings, LogOut, HelpCircle } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => logout(),
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block font-mono tracking-tight">IDE_PLATFORM</span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                location === "/" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className={`transition-colors hover:text-foreground/80 ${
                  location.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </span>
              </Link>
            )}
            <Link
              href="/help"
              className={`transition-colors hover:text-foreground/80 ${
                location.startsWith("/help") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </span>
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl py-6">
        {children}
      </main>
    </div>
  );
}
