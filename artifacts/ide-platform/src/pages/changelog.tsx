import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Circle, Clock, Zap, Package, Container, Layers, FileCode,
  Terminal, Globe, Database, Key, Activity, GitBranch, Shield, Smartphone,
  Code2, Server, Star
} from "lucide-react";

type Status = "done" | "progress" | "planned";

interface Item {
  text: string;
  status: Status;
  tag?: string;
}

interface Release {
  version: string;
  date: string;
  label: string;
  labelColor: string;
  icon: React.ReactNode;
  description: string;
  items: Item[];
}

const STATUS_ICON: Record<Status, React.ReactNode> = {
  done: <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />,
  progress: <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />,
  planned: <Circle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />,
};

const RELEASES: Release[] = [
  {
    version: "v0.7",
    date: "6 Agustus 2026",
    label: "Terbaru",
    labelColor: "bg-green-500/15 text-green-400 border-green-500/30",
    icon: <Container className="w-4 h-4" />,
    description: "Sistem template workspace — Docker-in-Docker, multi-language, packager panel, dan config runner.",
    items: [
      { text: "Template Docker-in-Docker (DinD): Docker CLI di workspace via host socket", status: "done", tag: "DinD" },
      { text: "Template Docker + Node.js dan Docker + Python dalam satu workspace", status: "done", tag: "DinD" },
      { text: "Template Multi-language: Full Stack (Node + Python + Docker), Node + Python", status: "done", tag: "Multi" },
      { text: "Config runner .workspace.toml — mirip .replit, define perintah run per template", status: "done", tag: "Config" },
      { text: "Packager panel baru di Tools sidebar — install command generator per template", status: "done", tag: "IDE" },
      { text: "Packager: toggle dev dependency, daftar popular packages, multi-pm (npm + pip)", status: "done", tag: "IDE" },
      { text: "Redesign template picker: category tabs, badge runtime, DinD/Multi-lang indicator", status: "done", tag: "UI" },
      { text: "17 template total: nodejs, python, php, go, rust, java, ruby, deno, dotnet, bash, html, cpp, dan 5 template Docker/Multi", status: "done", tag: "Template" },
      { text: "Dockerfile workspace-base: Docker CLI + docker-compose-plugin terinstall", status: "done", tag: "Infra" },
      { text: "Backend: mount Docker socket untuk workspace dengan DinD template", status: "progress", tag: "Backend" },
      { text: "Backend: baca .workspace.toml saat workspace start — auto-create workflows", status: "planned", tag: "Backend" },
    ],
  },
  {
    version: "v0.6",
    date: "6 Agustus 2026",
    label: "Stabil",
    labelColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <Smartphone className="w-4 h-4" />,
    description: "Autentikasi, mobile UI, dan import workspace dari sumber eksternal.",
    items: [
      { text: "Remember Me 30 hari — token persist di localStorage, auto refresh", status: "done", tag: "Auth" },
      { text: "Responsive mobile nav — hamburger menu + Sheet drawer untuk layar kecil", status: "done", tag: "UI" },
      { text: "Tab Import GitHub — clone repo ke workspace langsung dari form", status: "done", tag: "Import" },
      { text: "Tab Import ZIP — upload file zip lalu extract ke workspace", status: "done", tag: "Import" },
      { text: "API base URL fix — frontend pakai api.premhub.site bukan localhost", status: "done", tag: "Fix" },
      { text: "Error message API yang benar di setup & login page (error.data.error)", status: "done", tag: "Fix" },
      { text: "JWT token auto-dikirim di setiap request API via setAuthTokenGetter", status: "done", tag: "Auth" },
    ],
  },
  {
    version: "v0.5",
    date: "5 Agustus 2026",
    label: "Stabil",
    labelColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <Terminal className="w-4 h-4" />,
    description: "IDE inti — editor, terminal, tools panel lengkap.",
    items: [
      { text: "Monaco Editor — syntax highlight, IntelliSense, multi-tab file", status: "done", tag: "IDE" },
      { text: "Terminal xterm.js — WebSocket ke workspace container, multi-session", status: "done", tag: "IDE" },
      { text: "Workflows tab — create/start/stop/delete perintah run (npm start, python app.py, dll)", status: "done", tag: "Tools" },
      { text: "Ports tab — expose port ke URL publik via Traefik", status: "done", tag: "Tools" },
      { text: "Database tab — provisioning MySQL & PostgreSQL terisolasi per workspace", status: "done", tag: "Tools" },
      { text: "Secrets tab — env variable terenkripsi, inject ke container saat start", status: "done", tag: "Tools" },
      { text: "Domains tab — publish workspace, custom domain + DNS verification", status: "done", tag: "Tools" },
      { text: "Monitoring tab — CPU/RAM/Disk/Network real-time, polling 5 detik", status: "done", tag: "Tools" },
      { text: "Git tab — command helper (init, commit, push, pull, dll)", status: "done", tag: "Tools" },
      { text: "File tree — browse, buat, rename, hapus file/folder", status: "done", tag: "IDE" },
    ],
  },
  {
    version: "v0.4",
    date: "4 Agustus 2026",
    label: "Stabil",
    labelColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <Code2 className="w-4 h-4" />,
    description: "Setup awal platform — infra, auth, dashboard.",
    items: [
      { text: "Docker Compose infra: Traefik, PostgreSQL, API server, frontend", status: "done", tag: "Infra" },
      { text: "Setup page — buat akun admin pertama kali", status: "done", tag: "Auth" },
      { text: "Login page — JWT auth, session management", status: "done", tag: "Auth" },
      { text: "Dashboard — list workspace, create, start, stop, delete", status: "done", tag: "Core" },
      { text: "Admin panel — manajemen user, role, statistik platform", status: "done", tag: "Admin" },
      { text: "Drizzle ORM + PostgreSQL schema — workspaces, users, workflows, ports, database, secrets, domains", status: "done", tag: "DB" },
      { text: "API server Express.js + Zod validation — 40+ endpoints", status: "done", tag: "API" },
    ],
  },
  {
    version: "v0.8",
    date: "Akan Datang",
    label: "Roadmap",
    labelColor: "bg-muted text-muted-foreground border-border/40",
    icon: <Star className="w-4 h-4" />,
    description: "Fitur-fitur yang direncanakan untuk versi berikutnya.",
    items: [
      { text: "Git panel terintegrasi — connect GitHub/GitLab, push/pull langsung dari IDE", status: "planned", tag: "Git" },
      { text: "Real container orchestration — start/stop benar-benar jalankan/matikan Docker container", status: "planned", tag: "Infra" },
      { text: "Collaboration — share workspace, live code, cursor multi-user", status: "planned", tag: "Collab" },
      { text: "AI assistant — chat dengan AI, explain code, generate, refactor", status: "planned", tag: "AI" },
      { text: "Marketplace template — upload & share template custom", status: "planned", tag: "Template" },
      { text: "Build logs — tampilkan output docker build secara live", status: "planned", tag: "IDE" },
      { text: "Snapshot workspace — backup & restore state workspace", status: "planned", tag: "Infra" },
      { text: "Usage billing — tracking resource per user/workspace", status: "planned", tag: "Admin" },
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  DinD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Multi: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Config: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  IDE: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  UI: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Template: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Infra: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Backend: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Auth: "bg-green-500/10 text-green-400 border-green-500/20",
  Import: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Fix: "bg-red-500/10 text-red-400 border-red-500/20",
  Tools: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Core: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DB: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  API: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  Admin: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Git: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Collab: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  AI: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

function ReleaseCard({ release, isFirst }: { release: Release; isFirst: boolean }) {
  const doneCount = release.items.filter(i => i.status === "done").length;
  const totalCount = release.items.length;
  const progress = Math.round((doneCount / totalCount) * 100);
  const isRoadmap = release.label === "Roadmap";

  return (
    <div className={`relative pl-10 ${isRoadmap ? "opacity-70" : ""}`}>
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center
        ${isFirst ? "border-primary bg-primary/10 text-primary" : isRoadmap ? "border-muted-foreground/30 bg-muted/20 text-muted-foreground" : "border-border/60 bg-card text-muted-foreground"}`}>
        {release.icon}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-base font-mono">{release.version}</span>
          <Badge variant="outline" className={`text-[11px] px-2 py-0 ${release.labelColor}`}>
            {release.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{release.date}</span>
          {!isRoadmap && (
            <span className="text-xs text-muted-foreground ml-auto">
              {doneCount}/{totalCount} selesai
            </span>
          )}
        </div>

        {/* Progress bar (non-roadmap) */}
        {!isRoadmap && (
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground">{release.description}</p>

        {/* Items */}
        <div className="space-y-2">
          {release.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {STATUS_ICON[item.status]}
              <span className={`text-sm flex-1 leading-snug ${item.status === "planned" ? "text-muted-foreground" : "text-foreground/90"}`}>
                {item.text}
              </span>
              {item.tag && (
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 font-mono ${TAG_COLORS[item.tag] ?? "bg-muted text-muted-foreground border-border/40"}`}>
                  {item.tag}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const doneTotal = RELEASES.flatMap(r => r.items).filter(i => i.status === "done").length;
  const allTotal = RELEASES.flatMap(r => r.items).filter(i => i.status !== "planned" || true).length;
  const plannedTotal = RELEASES.flatMap(r => r.items).filter(i => i.status === "planned").length;
  const inProgressTotal = RELEASES.flatMap(r => r.items).filter(i => i.status === "progress").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Changelog & Progress</h1>
            <p className="text-sm text-muted-foreground">Riwayat perubahan dan rencana fitur platform</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Selesai", value: doneTotal, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "In Progress", value: inProgressTotal, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "Direncanakan", value: plannedTotal, color: "text-muted-foreground", bg: "bg-muted/20 border-border/40" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border px-4 py-3 ${stat.bg}`}>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Selesai
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-yellow-500" /> Sedang dikerjakan
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="w-3.5 h-3.5 text-muted-foreground/50" /> Direncanakan
          </div>
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Timeline */}
      <div className="relative space-y-10">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border/40" />

        {RELEASES.map((release, i) => (
          <ReleaseCard key={release.version} release={release} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
}
