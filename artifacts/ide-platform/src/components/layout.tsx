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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useLogout } from "@workspace/api-client-react";
import { Code2, LayoutDashboard, Settings, LogOut, HelpCircle, Menu } from "lucide-react";

const navLinks = (role: string) => [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (loc: string) => loc === "/" },
  ...(role === "admin"
    ? [{ href: "/admin", label: "Admin", icon: Settings, match: (loc: string) => loc.startsWith("/admin") }]
    : []),
  { href: "/help", label: "Bantuan", icon: HelpCircle, match: (loc: string) => loc.startsWith("/help") },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => logout() });
  };

  if (!user) return null;

  const links = navLinks(user.role);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6 max-w-screen-2xl mx-auto gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mr-4 shrink-0">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-bold font-mono tracking-tight hidden sm:inline">IDE_PLATFORM</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium flex-1">
            {links.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
                  match(location) ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex flex-1 md:flex-none items-center justify-end gap-2">
            {/* Avatar dropdown (desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden md:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.fullName || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="px-4 pt-5 pb-4 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-2 font-mono text-sm">
                    <Code2 className="h-5 w-5 text-primary" />
                    IDE_PLATFORM
                  </SheetTitle>
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{user.fullName || user.username}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                </SheetHeader>

                <nav className="flex flex-col gap-1 p-3">
                  {links.map(({ href, label, icon: Icon, match }) => (
                    <SheetClose asChild key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          match(location)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 container max-w-screen-2xl px-4 md:px-6 py-5 md:py-6">
        {children}
      </main>
    </div>
  );
}
