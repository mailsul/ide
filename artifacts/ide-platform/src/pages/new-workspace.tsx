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
import { Badge } from "@/components/ui/badge";
import { SiGithub } from "react-icons/si";
import { ArrowLeft, Loader2, TerminalSquare, Upload, Link as LinkIcon, FolderOpen, Star, Container, Layers, Zap } from "lucide-react";
import { Link } from "wouter";
import { WORKSPACE_TEMPLATES, CATEGORY_LABELS, CATEGORY_ORDER, POPULAR_TEMPLATES, type WorkspaceTemplate } from "@/lib/workspace-templates";

// ─── Validation schemas ───────────────────────────────────────────────────────
const baseSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  description: z.string().optional(),
  language: z.string().min(1, "Pilih template"),
});

const githubSchema = baseSchema.extend({
  githubUrl: z
    .string()
    .min(1, "URL GitHub wajib diisi")
    .url("Masukkan URL yang valid")
    .refine((v) => v.includes("github.com"), "Harus URL repository GitHub"),
});

const zipSchema = baseSchema;

// ─── Template Card ────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: WorkspaceTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-150 group ${
        isSelected
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-border/50 bg-background/50 hover:border-primary/40 hover:bg-background"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl shrink-0 w-9 h-9 flex items-center justify-center rounded-lg ${
          isSelected ? "bg-primary/20" : "bg-muted"
        }`}>
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold">{template.name}</span>
            {template.popular && (
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
            )}
            {template.dind && (
              <Container className="w-3 h-3 text-blue-400 shrink-0" title="Docker-in-Docker" />
            )}
            {template.runtimes.length > 1 && !template.dind && (
              <Layers className="w-3 h-3 text-violet-400 shrink-0" title="Multi-language" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {template.description}
          </p>
          {/* Runtime badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {template.runtimes.slice(0, 3).map((rt, i) => (
              <span
                key={rt}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  template.badgeColors[i] ?? template.badgeColors[0] ?? "bg-muted text-muted-foreground border-border/30"
                }`}
              >
                {rt}
              </span>
            ))}
            {template.runtimes.length > 3 && (
              <span className="text-[10px] text-muted-foreground px-1">+{template.runtimes.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Template Picker ──────────────────────────────────────────────────────────
function TemplatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("popular");

  const categories = ["popular", ...CATEGORY_ORDER];
  const displayTemplates =
    activeCategory === "popular"
      ? POPULAR_TEMPLATES
      : WORKSPACE_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory("popular")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
            activeCategory === "popular"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <Star className="w-3 h-3 inline mr-1" />
          Popular
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Docker-in-Docker notice */}
      {(activeCategory === "devops" || activeCategory === "fullstack") && (
        <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
          <Container className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-300 leading-relaxed">
            <strong>Docker-in-Docker:</strong> Template Docker menjalankan Docker CLI di dalam workspace — Docker daemon host di-mount via socket. Bisa build image, jalankan compose, dll.
          </p>
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
        {displayTemplates.map((tmpl) => (
          <TemplateCard
            key={tmpl.id}
            template={tmpl}
            isSelected={value === tmpl.id}
            onClick={() => onChange(tmpl.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Selected template summary ────────────────────────────────────────────────
function SelectedTemplateSummary({ templateId }: { templateId: string }) {
  const tmpl = WORKSPACE_TEMPLATES.find((t) => t.id === templateId);
  if (!tmpl) return null;

  return (
    <div className="flex items-center gap-3 bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5">
      <span className="text-xl">{tmpl.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{tmpl.name}</span>
          {tmpl.dind && <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10">DinD</Badge>}
          {tmpl.runtimes.length > 1 && !tmpl.dind && <Badge variant="outline" className="text-[10px] text-violet-400 border-violet-500/30 bg-violet-500/10">Multi-lang</Badge>}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{tmpl.description}</p>
      </div>
    </div>
  );
}

// ─── Empty (blank) workspace tab ─────────────────────────────────────────────
function EmptyTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: { name: "", description: "", language: "nodejs" },
  });

  const selectedLanguage = form.watch("language");

  const onSubmit = (data: z.infer<typeof baseSchema>) => {
    createMutation.mutate(
      { data: { name: data.name, description: data.description, language: data.language as any } },
      { onSuccess: (res) => setLocation(`/workspaces/${res.id}?showGuide=true`) }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          {/* Left: Details */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Detail Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
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
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kamu mau bikin apa?"
                        {...field}
                        className="bg-background/50 resize-none h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selected template summary */}
              {selectedLanguage && <SelectedTemplateSummary templateId={selectedLanguage} />}

              {/* Config file info */}
              <div className="bg-muted/20 border border-border/30 rounded-lg px-3 py-2 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Config Runner</p>
                <p className="text-[11px] text-muted-foreground">
                  Taruh <code className="font-mono text-primary bg-primary/10 px-1 rounded">.workspace.toml</code> di root workspace untuk konfigurasi run commands, environment, dan packages.
                </p>
              </div>

              {createMutation.error && (
                <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat Workspace...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Buat Workspace
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right: Template Picker */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Pilih Template</CardTitle>
              <CardDescription>
                Template menentukan runtime, package manager, dan config awal workspace.
                <br />
                <span className="flex items-center gap-1 mt-1 text-[11px]">
                  <Container className="w-3 h-3 text-blue-400" /> = Docker-in-Docker &nbsp;
                  <Layers className="w-3 h-3 text-violet-400" /> = Multi-language &nbsp;
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> = Popular
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TemplatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

// ─── GitHub import tab ────────────────────────────────────────────────────────
function GitHubTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const form = useForm<z.infer<typeof githubSchema>>({
    resolver: zodResolver(githubSchema),
    defaultValues: { name: "", description: "", language: "nodejs", githubUrl: "" },
  });

  const selectedLanguage = form.watch("language");

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
    createMutation.mutate(
      { data: { name: data.name, description: data.description, language: data.language as any, importUrl: data.githubUrl } as any },
      {
        onSuccess: (res) =>
          setLocation(
            `/workspaces/${res.id}?import=github&url=${encodeURIComponent(data.githubUrl)}`
          ),
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <SiGithub className="w-4 h-4" /> Import dari GitHub
              </CardTitle>
              <CardDescription>Clone repository GitHub ke workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
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
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Workspace</FormLabel>
                    <FormControl>
                      <Input placeholder="nama-proyek" {...field} className="bg-background/50 font-mono" />
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
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat..." {...field} className="bg-background/50 resize-none h-16" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {selectedLanguage && <SelectedTemplateSummary templateId={selectedLanguage} />}

              {createMutation.error && (
                <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimpor...</>
                ) : (
                  "Import & Buat Workspace"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Template Runtime</CardTitle>
              <CardDescription>Pilih runtime yang sesuai dengan proyek</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TemplatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

// ─── ZIP import tab ───────────────────────────────────────────────────────────
function ZipTab() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const form = useForm<z.infer<typeof zipSchema>>({
    resolver: zodResolver(zipSchema),
    defaultValues: { name: "", description: "", language: "nodejs" },
  });

  const selectedLanguage = form.watch("language");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!form.getValues("name")) {
      form.setValue(
        "name",
        file.name
          .replace(/\.zip$/i, "")
          .replace(/[^a-z0-9-_]/gi, "-")
          .toLowerCase()
      );
    }
  };

  const onSubmit = (data: z.infer<typeof zipSchema>) => {
    if (!fileRef.current?.files?.[0]) {
      form.setError("name", { message: "Pilih file ZIP terlebih dahulu" });
      return;
    }
    createMutation.mutate(
      { data: { name: data.name, description: data.description, language: data.language as any, importType: "zip" } as any },
      { onSuccess: (res) => setLocation(`/workspaces/${res.id}?import=zip`) }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload ZIP
              </CardTitle>
              <CardDescription>Upload file ZIP yang berisi kode proyekmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Workspace</FormLabel>
                    <FormControl>
                      <Input placeholder="nama-proyek" {...field} className="bg-background/50 font-mono" />
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
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat..." {...field} className="bg-background/50 resize-none h-16" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {selectedLanguage && <SelectedTemplateSummary templateId={selectedLanguage} />}

              {createMutation.error && (
                <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {(createMutation.error?.data as any)?.error || "Gagal membuat workspace."}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimpor...</>
                ) : (
                  "Import & Buat Workspace"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Template Runtime</CardTitle>
              <CardDescription>Pilih runtime yang sesuai dengan proyek</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TemplatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewWorkspace() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Baru</h1>
          <p className="text-muted-foreground text-sm">
            Mulai dari kosong, import dari GitHub, atau upload ZIP. Pilih template yang mendukung 1 atau lebih bahasa sekaligus.
          </p>
        </div>
      </div>

      <Tabs defaultValue="empty" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="empty" className="gap-2 text-xs sm:text-sm">
            <TerminalSquare className="w-4 h-4" />
            Baru
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

        <TabsContent value="empty">
          <EmptyTab />
        </TabsContent>
        <TabsContent value="github">
          <GitHubTab />
        </TabsContent>
        <TabsContent value="zip">
          <ZipTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
