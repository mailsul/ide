import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, sessionError, clearSessionError } = useAuth();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    clearSessionError();
    loginMutation.mutate(
      // cast karena generated type belum include rememberMe — field extra tetap dikirim ke backend
      { data: data as any },
      {
        onSuccess: (res) => {
          login(res.token, data.rememberMe);
          setLocation("/");
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background/50 relative overflow-hidden px-4">
      {/* Decorative blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <Code2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">IDE_PLATFORM</h1>
          <p className="text-muted-foreground text-sm mt-1">Masuk ke workspace kamu</p>
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
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="admin@example.com"
                          {...field}
                          className="bg-background/50"
                        />
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
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-background/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me */}
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label
                        htmlFor="rememberMe"
                        className="text-sm text-muted-foreground cursor-pointer select-none leading-none"
                      >
                        Ingat saya selama 30 hari
                      </label>
                    </FormItem>
                  )}
                />

                {sessionError && !loginMutation.error && (
                  <div className="text-sm text-amber-500 font-medium p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                    {sessionError}
                  </div>
                )}

                {loginMutation.error && (
                  <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    {(loginMutation.error?.data as any)?.error ||
                      loginMutation.error?.message ||
                      "Login gagal. Periksa email dan password."}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Masuk..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
