import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
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
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">IDE_PLATFORM</h1>
          <p className="text-muted-foreground mt-2">Sign in to your workspace</p>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/90 backdrop-blur-xl">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} className="bg-background/50" />
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
                
                {loginMutation.error && (
                  <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    {loginMutation.error.error || "Failed to login. Check credentials."}
                  </div>
                )}

                <Button type="submit" className="w-full font-semibold" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
