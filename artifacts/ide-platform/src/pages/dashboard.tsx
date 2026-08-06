import { Link } from "wouter";
import { useGetDashboardStats, useGetRecentActivity, useListWorkspaces } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TerminalSquare, Globe, Box, Play, Square, Activity, FolderOpen } from "lucide-react";
import { SiNodedotjs, SiPython, SiPhp, SiGo, SiRust, SiDeno } from "react-icons/si";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: workspaces, isLoading: workspacesLoading } = useListWorkspaces();

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "nodejs": return <SiNodedotjs className="w-5 h-5 text-green-500" />;
      case "python": return <SiPython className="w-5 h-5 text-blue-400" />;
      case "php": return <SiPhp className="w-5 h-5 text-purple-400" />;
      case "go": return <SiGo className="w-5 h-5 text-cyan-400" />;
      case "rust": return <SiRust className="w-5 h-5 text-orange-400" />;
      case "deno": return <SiDeno className="w-5 h-5 text-white" />;
      default: return <TerminalSquare className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "stopped": return "bg-muted-foreground";
      case "sleeping": return "bg-yellow-500";
      case "error": return "bg-red-500";
      case "starting": return "bg-blue-500 animate-pulse";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your workspaces and activity.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/workspaces/new">
            <Plus className="w-4 h-4" />
            New Workspace
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalWorkspaces || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.runningWorkspaces || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.publishedWorkspaces || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Databases</CardTitle>
            <Box className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalDatabases || 0}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Workspaces</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {workspacesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-32"><Skeleton className="h-full w-full rounded-xl" /></Card>
              ))
            ) : workspaces?.length === 0 ? (
              <Card className="col-span-full border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">No workspaces yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">Create your first workspace to start building.</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/workspaces/new">Create Workspace</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              workspaces?.slice(0, 6).map((ws) => (
                <Link key={ws.id} href={`/workspaces/${ws.id}`}>
                  <Card className="group hover:border-primary/50 transition-colors cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col hover-elevate">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-md border border-border/50 shadow-sm">
                            {getLanguageIcon(ws.language)}
                          </div>
                          <div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors">{ws.name}</CardTitle>
                            <CardDescription className="font-mono text-xs">{ws.slug}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(ws.status)}`} />
                          <span className="capitalize">{ws.status}</span>
                        </div>
                        {ws.isPublished && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Published</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {stats?.onboardingProgress && stats.onboardingProgress.percentage < 100 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Getting Started</CardTitle>
                <Progress value={stats.onboardingProgress.percentage} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className={`flex items-center gap-2 ${stats.onboardingProgress.accountCreated ? "text-primary" : "text-muted-foreground"}`}>
                    <Square className={`w-4 h-4 ${stats.onboardingProgress.accountCreated ? "fill-primary" : ""}`} /> Account Created
                  </li>
                  <li className={`flex items-center gap-2 ${stats.onboardingProgress.firstWorkspaceCreated ? "text-primary" : "text-muted-foreground"}`}>
                    <Square className={`w-4 h-4 ${stats.onboardingProgress.firstWorkspaceCreated ? "fill-primary" : ""}`} /> Create a Workspace
                  </li>
                  <li className={`flex items-center gap-2 ${stats.onboardingProgress.codeRan ? "text-primary" : "text-muted-foreground"}`}>
                    <Square className={`w-4 h-4 ${stats.onboardingProgress.codeRan ? "fill-primary" : ""}`} /> Run your code
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" /> Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activity?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
              ) : (
                <div className="space-y-4">
                  {activity?.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-primary/50 shrink-0" />
                      <div>
                        <p className="text-foreground/90">{item.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
