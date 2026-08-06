import { useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SiNodedotjs, SiPython, SiPhp, SiGo, SiRust,
  SiDeno, SiRuby, SiDotnet, SiHtml5, SiCplusplus, SiGithub
} from "react-icons/si";
import { ArrowLeft, Loader2, TerminalSquare, Upload, Link as LinkIcon, FolderOpen } from "lucide-react";
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

// --- Schema ---
const baseSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  description: z.string().optional(),
  language: z.nativeEnum(WorkspaceInputLanguage),
});

const githubSchema = baseSchema.extend({
  githubUrl: z
    .string()
    .min(1, "URL GitHub wajib diisi")
    .url("Masukkan URL yang valid")
    .refine((v) => v.includes("github.com"), "Harus URL repository GitHub"),
});

const zipSchema = baseSchema;

// --- Lang picker sub-component ---
function LanguagePicker({ value, onChange }: { value: WorkspaceInputLanguage; onChange: (v: WorkspaceInputLanguage) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
      {languages.map((lang) => {
        const isSelected = value === lang.id;
        const Icon = lang.icon;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => onChange(lang.id)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-150 ${
              isSelected
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/50 bg-background/50 hover:border-primary/50 hover:bg-background"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${isSelected ? lang.bg : "bg-muted"}`}>
              <Icon className={`w-5 h-5 ${lang.color}`} />
            </div>
            <span className="text-xs font-medium leading-none">{lang.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Empty (blank) workspace tab ---
function EmptyTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: { name: "", description: "", language: WorkspaceInputLanguage.nodejs },
  });

  const onSubmit = (data: z.infer<typeof baseSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: (res) => setLocation(`/workspaces/${res.id}?showGuide=true`),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Details */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader><CardTitle className="text-base">Detail Workspace</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-project" {...field} className="bg-background/50 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Kamu mau bikin apa?" {...field} className="bg-background/50 resize-none h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Bahasa / Template</CardTitle>
              <CardDescription>Pilih environment untuk workspace kamu</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LanguagePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {createMutation.error && (
          <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
            {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" className="min-w-[180px]" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Membuat...</> : "Buat Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// --- GitHub import tab ---
function GitHubTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const form = useForm<z.infer<typeof githubSchema>>({
    resolver: zodResolver(githubSchema),
    defaultValues: { name: "", description: "", language: WorkspaceInputLanguage.nodejs, githubUrl: "" },
  });

  // Auto-fill name from GitHub URL
  const handleUrlChange = (url: string, onChange: (v: string) => void) => {
    onChange(url);
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean);
      const repoName = parts[1]?.replace(/\.git$/, "");
      if (repoName && !form.getValues("name")) {
        form.setValue("name", repoName);
      }
    } catch {}
  };

  const onSubmit = (data: z.infer<typeof githubSchema>) => {
    // Buat workspace biasa dulu; setelah container start, backend akan clone repo
    createMutation.mutate(
      { data: { ...data, importUrl: data.githubUrl } as any },
      { onSuccess: (res) => setLocation(`/workspaces/${res.id}?import=github&url=${encodeURIComponent(data.githubUrl)}`) }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <SiGithub className="w-4 h-4" /> Import dari GitHub
              </CardTitle>
              <CardDescription>Masukkan URL repository GitHub untuk di-clone ke workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="githubUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Repository</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/user/repo"
                        {...field}
                        onChange={(e) => handleUrlChange(e.target.value, field.onChange)}
                        className="bg-background/50 pl-9 font-mono text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Workspace</FormLabel>
                  <FormControl>
                    <Input placeholder="nama-proyek" {...field} className="bg-background/50 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat..." {...field} className="bg-background/50 resize-none h-16" />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Bahasa Runtime</CardTitle>
              <CardDescription>Pilih runtime yang sesuai dengan proyek</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LanguagePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {createMutation.error && (
          <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
            {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" className="min-w-[180px]" disabled={createMutation.isPending}>
            {createMutation.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimpor...</>
              : "Import & Buat Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// --- ZIP import tab ---
function ZipTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const form = useForm<z.infer<typeof zipSchema>>({
    resolver: zodResolver(zipSchema),
    defaultValues: { name: "", description: "", language: WorkspaceInputLanguage.nodejs },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!form.getValues("name")) {
      form.setValue("name", file.name.replace(/\.zip$/i, "").replace(/[^a-z0-9-_]/gi, "-").toLowerCase());
    }
  };

  const onSubmit = (data: z.infer<typeof zipSchema>) => {
    if (!fileRef.current?.files?.[0]) {
      form.setError("name", { message: "Pilih file ZIP terlebih dahulu" });
      return;
    }
    // Buat workspace dulu, upload ZIP dilakukan setelah container siap
    createMutation.mutate(
      { data: { ...data, importType: "zip" } as any },
      { onSuccess: (res) => setLocation(`/workspaces/${res.id}?import=zip`) }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload ZIP
              </CardTitle>
              <CardDescription>Upload file ZIP yang berisi kode proyekmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {fileName ? (
                  <p className="text-sm font-medium text-foreground font-mono">{fileName}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Klik untuk pilih file ZIP</p>
                    <p className="text-xs text-muted-foreground mt-1">Maks. 50 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={handleFileChange} />
              </div>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Workspace</FormLabel>
                  <FormControl>
                    <Input placeholder="nama-proyek" {...field} className="bg-background/50 font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat..." {...field} className="bg-background/50 resize-none h-16" />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Bahasa Runtime</CardTitle>
              <CardDescription>Pilih runtime yang sesuai dengan proyek</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LanguagePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        {createMutation.error && (
          <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
            {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" className="min-w-[180px]" disabled={createMutation.isPending}>
            {createMutation.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimpor...</>
              : "Import & Buat Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function NewWorkspace() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Baru</h1>
          <p className="text-muted-foreground text-sm">Mulai dari kosong, import dari GitHub, atau upload ZIP.</p>
        </div>
      </div>

      <Tabs defaultValue="empty" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="empty" className="gap-2 text-xs sm:text-sm">
            <TerminalSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Baru</span>
            <span className="sm:hidden">Baru</span>
          </TabsTrigger>
          <TabsTrigger value="github" className="gap-2 text-xs sm:text-sm">
            <SiGithub className="w-4 h-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="zip" className="gap-2 text-xs sm:text-sm">
            <Upload className="w-4 h-4" />
            ZIP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empty"><EmptyTab /></TabsContent>
        <TabsContent value="github"><GitHubTab /></TabsContent>
        <TabsContent value="zip"><ZipTab /></TabsContent>
      </Tabs>
    </div>
  );
}
