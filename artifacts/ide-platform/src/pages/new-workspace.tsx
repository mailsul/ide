import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateWorkspace } from "@workspace/api-client-react";
import { WorkspaceInputLanguage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  SiNodedotjs, SiPython, SiPhp, SiGo, SiRust, 
  SiDeno, SiRuby, SiDotnet, SiHtml5, SiCplusplus
} from "react-icons/si";
import { ArrowLeft, Loader2, TerminalSquare } from "lucide-react";
import { Link } from "wouter";

const languages = [
  { id: WorkspaceInputLanguage.nodejs, name: "Node.js", icon: SiNodedotjs, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  { id: WorkspaceInputLanguage.python, name: "Python", icon: SiPython, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { id: WorkspaceInputLanguage.php, name: "PHP", icon: SiPhp, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  { id: WorkspaceInputLanguage.go, name: "Go", icon: SiGo, color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { id: WorkspaceInputLanguage.rust, name: "Rust", icon: SiRust, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { id: WorkspaceInputLanguage.ruby, name: "Ruby", icon: SiRuby, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  { id: WorkspaceInputLanguage.dotnet, name: ".NET", icon: SiDotnet, color: "text-purple-600", bg: "bg-purple-600/10 border-purple-600/20" },
  { id: WorkspaceInputLanguage.deno, name: "Deno", icon: SiDeno, color: "text-white", bg: "bg-white/10 border-white/20" },
  { id: WorkspaceInputLanguage.bash, name: "Bash", icon: TerminalSquare, color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20" },
  { id: WorkspaceInputLanguage.html, name: "HTML", icon: SiHtml5, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  { id: WorkspaceInputLanguage.cpp, name: "C++", icon: SiCplusplus, color: "text-blue-600", bg: "bg-blue-600/10 border-blue-600/20" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  language: z.nativeEnum(WorkspaceInputLanguage),
});

export default function NewWorkspace() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", language: WorkspaceInputLanguage.nodejs },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setLocation(`/workspaces/${res.id}?showGuide=true`);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Workspace</h1>
          <p className="text-muted-foreground">Select a language and give your workspace a name.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Workspace Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my-awesome-project" {...field} className="bg-background/50 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What are you building?" {...field} className="bg-background/50 resize-none h-24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Template / Language</CardTitle>
                <CardDescription>Select the environment for your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {languages.map((lang) => {
                            const isSelected = field.value === lang.id;
                            const Icon = lang.icon;
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => field.onChange(lang.id)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                                  isSelected 
                                    ? `border-primary bg-primary/10 ring-2 ring-primary/20` 
                                    : `border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background`
                                }`}
                              >
                                <div className={`p-2 rounded-lg ${isSelected ? lang.bg : "bg-muted"}`}>
                                  <Icon className={`w-6 h-6 ${lang.color}`} />
                                </div>
                                <span className="text-xs font-medium">{lang.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end border-t border-border/50 pt-6">
            <Button type="submit" size="lg" className="min-w-[200px]" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
