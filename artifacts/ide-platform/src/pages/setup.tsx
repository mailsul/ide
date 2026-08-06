import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServerCog } from "lucide-react";

const setupSchema = z.object({
  username: z.string().min(2).max(50),
  fullName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: { username: "", fullName: "", email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof setupSchema>) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          login(res.token);
          setLocation("/");
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background/50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <ServerCog className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground">First-Run Setup</h1>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Welcome to your new IDE Platform. Create the initial admin account to get started.
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Admin Account</CardTitle>
            <CardDescription>This account will have full access to all platform settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@example.com" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="System Admin" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {registerMutation.error && (
                  <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    {(registerMutation.error?.data as any)?.error || registerMutation.error?.message || "Failed to complete setup."}
                  </div>
                )}

                <Button type="submit" className="w-full font-semibold" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Creating Account..." : "Complete Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
