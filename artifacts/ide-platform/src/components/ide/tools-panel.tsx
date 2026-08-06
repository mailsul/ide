import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Play, Square, Trash2, Plus, Copy, Check, Eye, EyeOff, RefreshCw,
  Globe, Lock, Unlock, ExternalLink, GitBranch, Loader2, Info, Database,
  Activity, Key, Workflow, Server, ChevronDown, ChevronRight, Package, Container
} from "lucide-react";
import { getTemplate } from "@/lib/workspace-templates";
import {
  useListWorkflows, useCreateWorkflow, useStartWorkflow, useStopWorkflow, useDeleteWorkflow,
  useListPorts, useCreatePort, useDeletePort,
  useListSecrets, useCreateSecret, useDeleteSecret,
  useListDatabases, useCreateDatabase, useDeleteDatabase, useResetDatabasePassword,
  useListDomains, useCreateDomain, useDeleteDomain, useVerifyDomain,
  useGetMonitoring,
  usePublishWorkspace, useUnpublishWorkspace,
  getListWorkflowsQueryKey, getListPortsQueryKey, getListSecretsQueryKey,
  getListDatabasesQueryKey, getListDomainsQueryKey, getGetWorkspaceQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  language: string;
  status: string;
  isPublished: boolean;
  publishedUrl?: string | null;
  devUrl?: string | null;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
      onClick={() => { navigator.clipboard.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

// ─── WORKFLOWS ───────────────────────────────────────────────
function WorkflowsTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const { data: workflows, isLoading } = useListWorkflows(workspaceId, {
    query: { queryKey: getListWorkflowsQueryKey(workspaceId) }
  });
  const createMutation = useCreateWorkflow();
  const startMutation = useStartWorkflow();
  const stopMutation = useStopWorkflow();
  const deleteMutation = useDeleteWorkflow();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [port, setPort] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: getListWorkflowsQueryKey(workspaceId) });

  const handleCreate = () => {
    if (!name || !command) return;
    createMutation.mutate(
      { workspaceId, data: { name, command, port: port ? Number(port) : undefined, autoStart: false } },
      { onSuccess: () => { setName(""); setCommand(""); setPort(""); setShowForm(false); invalidate(); } }
    );
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workflows</span>
          <InfoTip text="Workflow adalah perintah untuk menjalankan aplikasi Anda. Contoh: 'npm start' untuk Node.js, atau 'python app.py' untuk Python." />
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-3 h-3" /> Tambah
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
          <Input placeholder="Nama (misal: Start Dev)" value={name} onChange={e => setName(e.target.value)} className="h-8 text-xs" />
          <Input placeholder="Perintah (misal: npm run dev)" value={command} onChange={e => setCommand(e.target.value)} className="h-8 text-xs font-mono" />
          <Input placeholder="Port (opsional, misal: 3000)" value={port} onChange={e => setPort(e.target.value)} className="h-8 text-xs" type="number" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreate} disabled={createMutation.isPending || !name || !command}>
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : workflows?.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
          <Workflow className="w-8 h-8 mx-auto opacity-30" />
          <p>Belum ada workflow. Tambah perintah untuk menjalankan aplikasi Anda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workflows?.map(wf => (
            <div key={wf.id} className="bg-card/50 border border-border/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${wf.status === "running" ? "bg-green-500 animate-pulse" : wf.status === "error" ? "bg-red-500" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium truncate">{wf.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {wf.status === "running" ? (
                    <Button variant="secondary" size="sm" className="h-6 text-xs px-2"
                      onClick={() => stopMutation.mutate({ workspaceId, workflowId: wf.id }, { onSuccess: invalidate })}
                      disabled={stopMutation.isPending}>
                      <Square className="w-3 h-3 fill-current mr-1" /> Stop
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" className="h-6 text-xs px-2 bg-green-600 hover:bg-green-700"
                      onClick={() => startMutation.mutate({ workspaceId, workflowId: wf.id }, { onSuccess: invalidate })}
                      disabled={startMutation.isPending}>
                      <Play className="w-3 h-3 fill-current mr-1" /> Run
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive"
                    onClick={() => deleteMutation.mutate({ workspaceId, workflowId: wf.id }, { onSuccess: invalidate })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <code className="text-[11px] font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded block truncate">{wf.command}</code>
              {wf.port && <span className="text-[10px] text-blue-400">Port: {wf.port}</span>}
              {wf.status === "running" && wf.pid && (
                <span className="text-[10px] text-muted-foreground">PID: {wf.pid}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PORTS ───────────────────────────────────────────────────
function PortsTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const { data: ports, isLoading } = useListPorts(workspaceId, {
    query: { queryKey: getListPortsQueryKey(workspaceId) }
  });
  const createMutation = useCreatePort();
  const deleteMutation = useDeletePort();

  const [showForm, setShowForm] = useState(false);
  const [internalPort, setInternalPort] = useState("");
  const [portName, setPortName] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: getListPortsQueryKey(workspaceId) });

  const handleCreate = () => {
    if (!internalPort || !portName) return;
    createMutation.mutate(
      { workspaceId, data: { internalPort: Number(internalPort), name: portName, isPrivate: false } },
      { onSuccess: () => { setInternalPort(""); setPortName(""); setShowForm(false); invalidate(); } }
    );
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ports</span>
          <InfoTip text="Port adalah 'pintu' untuk mengakses aplikasi Anda dari internet. Jika aplikasi berjalan di port 3000, tambahkan di sini untuk mendapat URL publik." />
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-3 h-3" /> Tambah
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
          <Input placeholder="Port internal (misal: 3000)" value={internalPort} onChange={e => setInternalPort(e.target.value)} className="h-8 text-xs" type="number" />
          <Input placeholder="Nama (misal: Dev Server)" value={portName} onChange={e => setPortName(e.target.value)} className="h-8 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreate} disabled={createMutation.isPending || !internalPort || !portName}>
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tambah Port"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : ports?.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
          <Server className="w-8 h-8 mx-auto opacity-30" />
          <p>Belum ada port. Tambah port untuk mendapat URL publik bagi aplikasi Anda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ports?.map(p => (
            <div key={p.id} className="bg-card/50 border border-border/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{p.internalPort}</Badge>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive"
                  onClick={() => deleteMutation.mutate({ workspaceId, portId: p.id }, { onSuccess: invalidate })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {p.externalUrl && (
                <div className="flex items-center gap-1">
                  <a href={p.externalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-mono text-primary hover:underline truncate flex-1">
                    {p.externalUrl}
                  </a>
                  <CopyBtn value={p.externalUrl} />
                  <a href={p.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink className="w-3 h-3" /></Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DATABASE ─────────────────────────────────────────────────
function DatabaseTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const { data: databases, isLoading } = useListDatabases(workspaceId, {
    query: { queryKey: getListDatabasesQueryKey(workspaceId) }
  });
  const createMutation = useCreateDatabase();
  const deleteMutation = useDeleteDatabase();
  const resetPasswordMutation = useResetDatabasePassword();

  const [dbType, setDbType] = useState<"mysql" | "postgres">("mysql");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});

  const invalidate = () => qc.invalidateQueries({ queryKey: getListDatabasesQueryKey(workspaceId) });

  const mysqlDbs = databases?.filter(d => d.dbType === "mysql") || [];
  const postgresDbs = databases?.filter(d => d.dbType === "postgres") || [];

  const handleCreate = (type: "mysql" | "postgres") => {
    createMutation.mutate(
      { workspaceId, data: { dbType: type } },
      { onSuccess: () => invalidate() }
    );
  };

  const handleResetPassword = (databaseId: string) => {
    resetPasswordMutation.mutate(
      { workspaceId, databaseId },
      {
        onSuccess: (data) => {
          if (data.dbPassword) {
            setNewPasswords(prev => ({ ...prev, [databaseId]: data.dbPassword! }));
          }
          invalidate();
        }
      }
    );
  };

  function DbCard({ db }: { db: NonNullable<typeof databases>[0] }) {
    const showPass = showPasswords[db.id] || false;
    const newPass = newPasswords[db.id];
    const isMySQL = db.dbType === "mysql";
    const adminUrl = isMySQL
      ? "https://phpmyadmin.yourdomain.com"
      : "https://pgadmin.yourdomain.com";
    const adminLabel = isMySQL ? "Buka phpMyAdmin" : "Buka pgAdmin";

    const fields = [
      { label: "Host", value: db.dbHost || (isMySQL ? "mysql.internal" : "postgres.internal") },
      { label: "Port", value: String(db.dbPort || (isMySQL ? 3306 : 5432)) },
      { label: "Database", value: db.dbName || "" },
      { label: "User", value: db.dbUser || "" },
    ];

    return (
      <div className="bg-card/50 border border-border/40 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] ${isMySQL ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
              {isMySQL ? "MySQL" : "PostgreSQL"}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">{db.dbName}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive"
            onClick={() => deleteMutation.mutate({ workspaceId, databaseId: db.id }, { onSuccess: invalidate })}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-1.5">
          {fields.map(f => (
            <div key={f.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground w-16 shrink-0">{f.label}</span>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <code className="font-mono text-foreground truncate">{f.value}</code>
                <CopyBtn value={f.value} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground w-16 shrink-0">Password</span>
            <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
              <code className="font-mono text-foreground truncate">
                {showPass ? (newPass || "••••••••") : "••••••••"}
              </code>
              <Button variant="ghost" size="icon" className="h-6 w-6"
                onClick={() => setShowPasswords(prev => ({ ...prev, [db.id]: !prev[db.id] }))}>
                {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          {db.connectionUrl && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground w-16 shrink-0">URL</span>
              <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                <code className="font-mono text-foreground text-[10px] truncate">{db.connectionUrl}</code>
                <CopyBtn value={db.connectionUrl} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="h-7 text-xs w-full gap-1">
              <ExternalLink className="w-3 h-3" /> {adminLabel}
            </Button>
          </a>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
            onClick={() => handleResetPassword(db.id)}
            disabled={resetPasswordMutation.isPending}>
            <RefreshCw className="w-3 h-3" /> Reset Pass
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Database</span>
        <InfoTip text="Setiap workspace mendapat database terisolasi. Akses via phpMyAdmin (MySQL) atau pgAdmin (PostgreSQL) yang sudah tersedia." />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* MySQL section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" /> MySQL
              </span>
              {mysqlDbs.length === 0 && (
                <Button variant="outline" size="sm" className="h-6 text-xs"
                  onClick={() => handleCreate("mysql")} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Plus className="w-3 h-3 mr-1" /> Buat Database</>}
                </Button>
              )}
            </div>
            {mysqlDbs.map(db => <DbCard key={db.id} db={db} />)}
          </div>

          <Separator className="opacity-30" />

          {/* PostgreSQL section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> PostgreSQL
              </span>
              {postgresDbs.length === 0 && (
                <Button variant="outline" size="sm" className="h-6 text-xs"
                  onClick={() => handleCreate("postgres")} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Plus className="w-3 h-3 mr-1" /> Buat Database</>}
                </Button>
              )}
            </div>
            {postgresDbs.map(db => <DbCard key={db.id} db={db} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SECRETS ─────────────────────────────────────────────────
function SecretsTab({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const { data: secrets, isLoading } = useListSecrets(workspaceId, {
    query: { queryKey: getListSecretsQueryKey(workspaceId) }
  });
  const createMutation = useCreateSecret();
  const deleteMutation = useDeleteSecret();

  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: getListSecretsQueryKey(workspaceId) });

  const handleCreate = () => {
    if (!key || !value) return;
    createMutation.mutate(
      { workspaceId, data: { key, value } },
      { onSuccess: () => { setKey(""); setValue(""); setShowForm(false); invalidate(); } }
    );
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Secrets</span>
          <InfoTip text="Secrets adalah variabel rahasia seperti API key atau password. Disimpan terenkripsi dan di-inject ke aplikasi sebagai environment variable. Jangan simpan di kode!" />
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-3 h-3" /> Tambah
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
          <Input placeholder="KEY (misal: API_KEY)" value={key} onChange={e => setKey(e.target.value.toUpperCase().replace(/\s/g, '_'))} className="h-8 text-xs font-mono" />
          <Input placeholder="Value (nilai secret)" value={value} onChange={e => setValue(e.target.value)} className="h-8 text-xs" type="password" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreate} disabled={createMutation.isPending || !key || !value}>
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Simpan Secret"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : secrets?.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
          <Key className="w-8 h-8 mx-auto opacity-30" />
          <p>Belum ada secrets. Tambah API key atau konfigurasi rahasia di sini.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {secrets?.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-card/50 border border-border/40 rounded-md px-3 py-2 group">
              <div className="flex items-center gap-2 min-w-0">
                <Key className="w-3 h-3 text-muted-foreground shrink-0" />
                <code className="text-xs font-mono truncate">{s.key}</code>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-muted-foreground font-mono">••••••</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate({ workspaceId, secretId: s.id }, { onSuccess: invalidate })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DOMAINS ─────────────────────────────────────────────────
function DomainsTab({ workspaceId, workspace }: { workspaceId: string; workspace: Workspace }) {
  const qc = useQueryClient();
  const { data: domains, isLoading } = useListDomains(workspaceId, {
    query: { queryKey: getListDomainsQueryKey(workspaceId) }
  });
  const createMutation = useCreateDomain();
  const deleteMutation = useDeleteDomain();
  const verifyMutation = useVerifyDomain();
  const publishMutation = usePublishWorkspace();
  const unpublishMutation = useUnpublishWorkspace();

  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListDomainsQueryKey(workspaceId) });
    qc.invalidateQueries({ queryKey: getGetWorkspaceQueryKey(workspaceId) });
  };

  const devUrl = workspace.devUrl || `https://ws-${workspaceId.slice(0, 8)}.preview.localhost`;

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domains</span>
        <InfoTip text="Hubungkan domain Anda sendiri atau gunakan subdomain gratis dari platform. Publish agar website online 24/7." />
      </div>

      {/* Publish toggle */}
      <div className="bg-card/50 border border-border/40 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Publish Website</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Online 24/7 dengan URL permanen</p>
          </div>
          {workspace.isPublished ? (
            <Button variant="secondary" size="sm" className="h-7 text-xs"
              onClick={() => unpublishMutation.mutate({ workspaceId }, { onSuccess: invalidate })}
              disabled={unpublishMutation.isPending}>
              {unpublishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Unpublish"}
            </Button>
          ) : (
            <Button size="sm" className="h-7 text-xs bg-primary"
              onClick={() => publishMutation.mutate({ workspaceId }, { onSuccess: invalidate })}
              disabled={publishMutation.isPending}>
              {publishMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Globe className="w-3 h-3 mr-1" /> Publish</>}
            </Button>
          )}
        </div>
        {workspace.isPublished && workspace.publishedUrl && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <a href={workspace.publishedUrl} target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-mono text-primary hover:underline truncate flex-1">
              {workspace.publishedUrl}
            </a>
            <CopyBtn value={workspace.publishedUrl} />
          </div>
        )}
      </div>

      {/* Dev URL */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dev URL (sementara)</p>
        <div className="flex items-center gap-1">
          <code className="text-[11px] font-mono text-muted-foreground truncate flex-1 bg-muted/30 px-2 py-1 rounded">{devUrl}</code>
          <CopyBtn value={devUrl} />
        </div>
        <p className="text-[10px] text-muted-foreground">Akan sleep setelah idle. Publish untuk URL permanen.</p>
      </div>

      <Separator className="opacity-30" />

      {/* Custom domains */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Domain Sendiri</p>
          <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-3 h-3" /> Hubungkan
          </Button>
        </div>

        {showForm && (
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-2">
            <Input placeholder="contoh.com atau sub.contoh.com" value={domain} onChange={e => setDomain(e.target.value)} className="h-8 text-xs font-mono" />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs flex-1"
                onClick={() => createMutation.mutate({ workspaceId, data: { domain } }, { onSuccess: () => { setDomain(""); setShowForm(false); invalidate(); } })}
                disabled={createMutation.isPending || !domain}>
                {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Hubungkan"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : domains?.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">Belum ada domain terhubung.</p>
        ) : (
          <div className="space-y-2">
            {domains?.map(d => (
              <div key={d.id} className="bg-card/50 border border-border/40 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono truncate">{d.domain}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${d.status === "active" ? "text-green-400 border-green-500/30" : d.status === "error" ? "text-red-400 border-red-500/30" : "text-yellow-400 border-yellow-500/30"}`}>
                      {d.status === "active" ? "Aktif" : d.status === "error" ? "Error" : "Pending"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ workspaceId, domainId: d.id }, { onSuccess: invalidate })}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {d.status === "pending" && d.dnsRecord && (
                  <div className="bg-muted/30 rounded p-2 space-y-1.5">
                    <p className="text-[10px] font-semibold text-yellow-400">Set DNS record ini di Cloudflare/provider Anda:</p>
                    <div className="text-[10px] font-mono space-y-0.5">
                      <p><span className="text-muted-foreground">Type:</span> {d.dnsRecord.type}</p>
                      <p><span className="text-muted-foreground">Name:</span> {d.dnsRecord.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="truncate flex-1">{d.dnsRecord.value}</span>
                        <CopyBtn value={d.dnsRecord.value || ""} />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] w-full"
                      onClick={() => verifyMutation.mutate({ workspaceId, domainId: d.id }, { onSuccess: invalidate })}
                      disabled={verifyMutation.isPending}>
                      {verifyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Cek DNS Sekarang
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MONITORING ───────────────────────────────────────────────
function MonitoringTab({ workspaceId }: { workspaceId: string }) {
  const { data: stats, isLoading, refetch } = useGetMonitoring(workspaceId, {
    query: { refetchInterval: 5000 }
  });

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatUptime(seconds: number) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}h ${h}j`;
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitoring</span>
          <InfoTip text="Statistik penggunaan resource workspace Anda secara real-time." />
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : stats ? (
        <div className="space-y-4">
          {/* CPU */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CPU</span>
              <span className="font-mono font-medium">{stats.cpuPercent}%</span>
            </div>
            <Progress value={stats.cpuPercent} className="h-2" />
          </div>

          {/* RAM */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">RAM</span>
              <span className="font-mono font-medium">{stats.memoryMb} / {stats.memoryLimitMb} MB</span>
            </div>
            <Progress value={(stats.memoryMb / stats.memoryLimitMb) * 100} className="h-2" />
          </div>

          {/* Disk */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Disk</span>
              <span className="font-mono font-medium">{stats.diskMb} / {stats.diskLimitMb} MB</span>
            </div>
            <Progress value={(stats.diskMb / stats.diskLimitMb) * 100} className="h-2" />
          </div>

          <Separator className="opacity-30" />

          {/* Network */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/50 border border-border/40 rounded-md p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Network In</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{formatBytes(stats.networkIn)}</p>
            </div>
            <div className="bg-card/50 border border-border/40 rounded-md p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Network Out</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{formatBytes(stats.networkOut)}</p>
            </div>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between bg-card/50 border border-border/40 rounded-md px-3 py-2">
            <span className="text-xs text-muted-foreground">Uptime</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-mono font-semibold">{formatUptime(stats.uptime)}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">Data tidak tersedia</p>
      )}
    </div>
  );
}

// ─── PACKAGER ─────────────────────────────────────────────────
function PackagerTab({ workspaceId, language }: { workspaceId: string; language: string }) {
  const template = getTemplate(language);
  const [activePm, setActivePm] = useState(template.packageManagers[0]?.id ?? "npm");
  const [searchPkg, setSearchPkg] = useState("");
  const [devDep, setDevDep] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const pm = template.packageManagers.find(p => p.id === activePm) ?? template.packageManagers[0];

  const copyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCmd = pm
    ? searchPkg.trim()
      ? (devDep && pm.devInstallCmd ? pm.devInstallCmd(searchPkg.trim()) : pm.installCmd(searchPkg.trim()))
      : null
    : null;

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Packages</span>
        <InfoTip text="Panel Packager membantu Anda menginstall packages. Salin perintah lalu jalankan di terminal workspace." />
      </div>

      {/* Template info */}
      <div className="bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{template.icon}</span>
          <span className="text-xs font-semibold">{template.name}</span>
          {template.dind && (
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1">
              <Container className="w-2.5 h-2.5" /> DinD
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {template.runtimes.map((rt, i) => (
            <span key={rt} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${template.badgeColors[i] ?? template.badgeColors[0] ?? "bg-muted text-muted-foreground border-border/30"}`}>
              {rt}
            </span>
          ))}
        </div>
      </div>

      {/* Package manager tabs (if multi-pm) */}
      {template.packageManagers.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {template.packageManagers.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePm(p.id); setSearchPkg(""); }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors border ${
                activePm === p.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Install input */}
      {pm && (
        <div className="space-y-2">
          <div className="relative">
            <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={`Nama package (misal: express)`}
              value={searchPkg}
              onChange={e => setSearchPkg(e.target.value)}
              className="pl-8 h-9 text-xs font-mono bg-background/50"
            />
          </div>

          {/* Dev dep toggle (nodejs only) */}
          {pm.devInstallCmd && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setDevDep(v => !v)}
                className={`w-7 h-4 rounded-full transition-colors ${devDep ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform mt-0.5 ${devDep ? "translate-x-3.5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-xs text-muted-foreground">Dev dependency</span>
            </label>
          )}

          {/* Generated command */}
          {installCmd && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Perintah install</p>
              <div className="flex items-start gap-2 bg-background/60 border border-border/40 rounded-lg px-3 py-2">
                <code className="text-[11px] font-mono text-green-400 flex-1 leading-relaxed whitespace-pre-wrap break-all">{installCmd}</code>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                  onClick={() => copyCmd(installCmd, "install")}
                >
                  {copied === "install" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Jalankan perintah ini di terminal workspace ↓</p>
            </div>
          )}
        </div>
      )}

      <Separator className="opacity-30" />

      {/* Common packages */}
      {pm && pm.commonPackages.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Package Populer</p>
          <div className="space-y-1">
            {pm.commonPackages.map(pkg => {
              const cmd = pm.installCmd(pkg);
              return (
                <div key={pkg} className="flex items-center justify-between bg-card/30 border border-border/30 rounded-md px-3 py-1.5 group">
                  <code className="text-[11px] font-mono">{pkg}</code>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6"
                      onClick={() => copyCmd(cmd, pkg)}
                    >
                      {copied === pkg ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="h-6 text-[10px] px-2"
                      onClick={() => setSearchPkg(pkg)}
                    >
                      Pilih
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator className="opacity-30" />

      {/* List installed */}
      {pm && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Lihat Package Terinstall</p>
          <div className="flex items-center gap-2 bg-background/60 border border-border/40 rounded-lg px-3 py-2">
            <code className="text-[11px] font-mono text-yellow-400 flex-1">{pm.listCmd}</code>
            <Button
              variant="ghost" size="icon" className="h-6 w-6 shrink-0"
              onClick={() => copyCmd(pm.listCmd, "list")}
            >
              {copied === "list" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Jalankan di terminal untuk melihat packages yang sudah terinstall.</p>
        </div>
      )}
    </div>
  );
}

// ─── GIT ─────────────────────────────────────────────────────
function GitTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const commands = [
    { id: "init", label: "Inisialisasi repo", cmd: "git init", desc: "Mulai repo Git baru di workspace ini" },
    { id: "add", label: "Stage semua file", cmd: "git add .", desc: "Tambahkan semua perubahan ke staging area" },
    { id: "commit", label: "Commit", cmd: 'git commit -m "Initial commit"', desc: "Simpan perubahan dengan pesan commit" },
    { id: "remote", label: "Tambah remote", cmd: "git remote add origin https://github.com/user/repo.git", desc: "Hubungkan ke GitHub/GitLab" },
    { id: "push", label: "Push ke remote", cmd: "git push -u origin main", desc: "Upload kode ke repository remote" },
    { id: "pull", label: "Pull dari remote", cmd: "git pull origin main", desc: "Download update terbaru dari remote" },
    { id: "status", label: "Cek status", cmd: "git status", desc: "Lihat file yang berubah" },
    { id: "log", label: "Lihat history", cmd: "git log --oneline", desc: "Tampilkan riwayat commit" },
  ];

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Git</span>
        <InfoTip text="Gunakan terminal di bawah untuk menjalankan perintah Git. Salin perintah di sini lalu paste di terminal." />
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Buka terminal di bawah, lalu jalankan perintah Git yang Anda butuhkan. Salin dari sini atau ketik langsung.</span>
      </div>

      <div className="space-y-1.5">
        {commands.map(c => (
          <div key={c.id} className="border border-border/40 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
              {expanded === c.id ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {expanded === c.id && (
              <div className="px-3 pb-3 space-y-2 bg-muted/10">
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                <div className="flex items-center gap-2 bg-background/50 border border-border/30 rounded px-2 py-1.5">
                  <code className="text-[11px] font-mono flex-1 text-green-400">{c.cmd}</code>
                  <CopyBtn value={c.cmd} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN TOOLS PANEL ────────────────────────────────────────
export function ToolsPanel({ workspace }: { workspace: Workspace }) {
  return (
    <div className="flex flex-col h-full bg-card/20">
      <div className="h-10 border-b border-border/50 px-3 flex items-center shrink-0">
        <span className="text-xs font-semibold text-foreground/70">Tools</span>
      </div>
      <ScrollArea className="flex-1">
        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border/30 rounded-none h-9 px-3 gap-1 overflow-x-auto">
            {[
              { value: "workflows", icon: Workflow, label: "Workflows" },
              { value: "packages", icon: Package, label: "Packages" },
              { value: "ports", icon: Server, label: "Ports" },
              { value: "database", icon: Database, label: "Database" },
              { value: "secrets", icon: Key, label: "Secrets" },
              { value: "domains", icon: Globe, label: "Domains" },
              { value: "monitoring", icon: Activity, label: "Monitor" },
              { value: "git", icon: GitBranch, label: "Git" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="h-7 text-[11px] px-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0">
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="workflows" className="mt-0 border-0 p-0">
            <WorkflowsTab workspaceId={workspace.id} />
          </TabsContent>
          <TabsContent value="packages" className="mt-0 border-0 p-0">
            <PackagerTab workspaceId={workspace.id} language={workspace.language} />
          </TabsContent>
          <TabsContent value="ports" className="mt-0 border-0 p-0">
            <PortsTab workspaceId={workspace.id} />
          </TabsContent>
          <TabsContent value="database" className="mt-0 border-0 p-0">
            <DatabaseTab workspaceId={workspace.id} />
          </TabsContent>
          <TabsContent value="secrets" className="mt-0 border-0 p-0">
            <SecretsTab workspaceId={workspace.id} />
          </TabsContent>
          <TabsContent value="domains" className="mt-0 border-0 p-0">
            <DomainsTab workspaceId={workspace.id} workspace={workspace} />
          </TabsContent>
          <TabsContent value="monitoring" className="mt-0 border-0 p-0">
            <MonitoringTab workspaceId={workspace.id} />
          </TabsContent>
          <TabsContent value="git" className="mt-0 border-0 p-0">
            <GitTab />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
