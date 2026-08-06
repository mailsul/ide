import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminGetStats, useAdminListUsers, useAdminListWorkspaces, useAdminGetSettings, useAdminUpdateSettings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Users, HardDrive, MonitorPlay } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetSettingsQueryKey } from "@workspace/api-client-react";

export default function AdminPanel() {
  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, workspaces, and platform settings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.totalWorkspaces || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Workspaces</CardTitle>
            <MonitorPlay className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.runningWorkspaces || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{1}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="workspaces" className="space-y-4">
          <WorkspacesTab />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAdminListUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.plan}</Badge>
                  </TableCell>
                  <TableCell>{user.workspaceCount || 0}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function WorkspacesTab() {
  const { data: workspaces, isLoading } = useAdminListWorkspaces();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspaces</CardTitle>
        <CardDescription>All workspaces across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces?.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>{ws.username || ws.userId}</TableCell>
                  <TableCell className="capitalize">{ws.language}</TableCell>
                  <TableCell>
                    <Badge variant={ws.status === "running" ? "default" : "secondary"} className="capitalize">{ws.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(ws.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

const settingsSchema = z.object({
  platformName: z.string().min(1),
  domain: z.string().min(1),
  registrationEnabled: z.boolean(),
  defaultPlan: z.enum(["free", "pro", "team"]),
});

function SettingsTab() {
  const { data: settings, isLoading } = useAdminGetSettings();
  const updateSettings = useAdminUpdateSettings();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      platformName: settings?.platformName || "IDE Platform",
      domain: settings?.domain || "ide.example.com",
      registrationEnabled: settings?.registrationEnabled ?? true,
      defaultPlan: settings?.defaultPlan || "free",
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
      }
    });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>Global configuration for the IDE platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="platformName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Domain</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Registration</FormLabel>
                    <CardDescription>Anyone can create an account on this platform.</CardDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
