import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Terminal, Globe, Database, Key, Workflow, Server, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SiNodedotjs, SiPython, SiPhp, SiGo, SiRust,
  SiDeno, SiHtml5
} from "react-icons/si";
import { TerminalSquare } from "lucide-react";

interface Guide {
  id: string;
  language: string;
  icon: React.ReactNode;
  color: string;
  steps: { title: string; code?: string; desc: string }[];
}

const guides: Guide[] = [
  {
    id: "nodejs",
    language: "Node.js",
    icon: <SiNodedotjs className="w-5 h-5" />,
    color: "text-green-500",
    steps: [
      { title: "Buat project baru", code: "npm init -y", desc: "Perintah ini membuat file package.json — file konfigurasi project Node.js Anda." },
      { title: "Install Express", code: "npm install express", desc: "Express adalah framework web untuk Node.js. Ini yang paling umum digunakan untuk buat server." },
      { title: "Buat file index.js", desc: 'Buat file baru bernama index.js, lalu isi dengan kode berikut:', code: `const express = require('express')\nconst app = express()\n\napp.get('/', (req, res) => {\n  res.send('Hello World!')\n})\n\napp.listen(process.env.PORT || 3000, () => {\n  console.log('Server berjalan!')\n})` },
      { title: "Tambah Workflow", desc: "Klik Tools → Workflows → Tambah. Isi:\n• Nama: Start Server\n• Perintah: node index.js\n• Port: 3000\nLalu klik Run." },
      { title: "Buka Preview", desc: "Klik tab Preview di kanan atas. Website Anda sekarang bisa diakses!" },
    ]
  },
  {
    id: "python",
    language: "Python",
    icon: <SiPython className="w-5 h-5" />,
    color: "text-blue-400",
    steps: [
      { title: "Install Flask", code: "pip3 install flask", desc: "Flask adalah framework web Python yang ringan dan mudah dipelajari." },
      { title: "Buat file app.py", desc: "Buat file bernama app.py dan isi kode berikut:", code: `from flask import Flask\napp = Flask(__name__)\n\n@app.route('/')\ndef hello():\n    return 'Hello World!'\n\nif __name__ == '__main__':\n    app.run(host='0.0.0.0', port=3000)` },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: Start App\n• Perintah: python3 app.py\n• Port: 3000" },
      { title: "Buka Preview", desc: "Klik Preview. Website Flask Anda sudah online!" },
    ]
  },
  {
    id: "php",
    language: "PHP",
    icon: <SiPhp className="w-5 h-5" />,
    color: "text-purple-400",
    steps: [
      { title: "Buat file index.php", desc: "Buat file index.php dan isi:", code: `<?php\necho '<h1>Hello World!</h1>';\necho '<p>Aplikasi PHP saya berjalan!</p>';\n?>` },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: PHP Server\n• Perintah: php -S 0.0.0.0:3000\n• Port: 3000" },
      { title: "Dengan Database", desc: "Aktifkan MySQL di Tools → Database. Kredensial akan otomatis tersedia sebagai environment variable MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE." },
      { title: "Buka Preview", desc: "Klik Preview untuk melihat halaman PHP Anda." },
    ]
  },
  {
    id: "go",
    language: "Go",
    icon: <SiGo className="w-5 h-5" />,
    color: "text-cyan-400",
    steps: [
      { title: "Inisialisasi module", code: "go mod init myapp", desc: "Membuat file go.mod untuk project Go Anda." },
      { title: "Buat file main.go", desc: "Buat main.go:", code: `package main\n\nimport (\n    "fmt"\n    "net/http"\n    "os"\n)\n\nfunc main() {\n    port := os.Getenv("PORT")\n    if port == "" {\n        port = "3000"\n    }\n    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {\n        fmt.Fprintln(w, "Hello World!")\n    })\n    http.ListenAndServe(":"+port, nil)\n}` },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: Run Go\n• Perintah: go run main.go\n• Port: 3000" },
    ]
  },
  {
    id: "html",
    language: "HTML/CSS/JS",
    icon: <SiHtml5 className="w-5 h-5" />,
    color: "text-orange-400",
    steps: [
      { title: "Buat file index.html", desc: "Buat file index.html — ini adalah halaman utama website Anda:", code: `<!DOCTYPE html>\n<html lang="id">\n<head>\n    <meta charset="UTF-8">\n    <title>Website Saya</title>\n</head>\n<body>\n    <h1>Halo Dunia!</h1>\n    <p>Website pertama saya.</p>\n</body>\n</html>` },
      { title: "Serve via HTTP server", desc: "Jalankan server sederhana lewat terminal:", code: "python3 -m http.server 3000" },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: Static Server\n• Perintah: python3 -m http.server 3000\n• Port: 3000" },
      { title: "Buka Preview", desc: "Klik Preview — website HTML Anda langsung tampil!" },
    ]
  },
  {
    id: "rust",
    language: "Rust",
    icon: <SiRust className="w-5 h-5" />,
    color: "text-orange-500",
    steps: [
      { title: "Buat project baru", code: "cargo new myapp && cd myapp", desc: "Cargo adalah package manager Rust. Ini membuat project baru." },
      { title: "Install Actix-web", desc: "Tambahkan ke Cargo.toml:", code: `[dependencies]\nactix-web = "4"\ntokio = { version = "1", features = ["full"] }` },
      { title: "Edit src/main.rs", desc: "", code: `use actix_web::{web, App, HttpResponse, HttpServer};\n\nasync fn hello() -> HttpResponse {\n    HttpResponse::Ok().body("Hello World!")\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    HttpServer::new(|| App::new().route("/", web::get().to(hello)))\n        .bind("0.0.0.0:3000")?\n        .run()\n        .await\n}` },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: Run Rust\n• Perintah: cargo run\n• Port: 3000" },
    ]
  },
  {
    id: "deno",
    language: "Deno",
    icon: <SiDeno className="w-5 h-5" />,
    color: "text-white",
    steps: [
      { title: "Buat file main.ts", desc: "Buat main.ts:", code: `import { serve } from "https://deno.land/std/http/server.ts";\n\nconst port = Number(Deno.env.get("PORT") || 3000);\n\nserve((_req) => {\n  return new Response("Hello World!");\n}, { port });` },
      { title: "Tambah Workflow", desc: "Tools → Workflows → Tambah:\n• Nama: Run Deno\n• Perintah: deno run --allow-net --allow-env main.ts\n• Port: 3000" },
    ]
  },
];

const faqItems = [
  {
    q: "Kenapa website saya tidak bisa diakses?",
    a: "Pastikan: 1) Workflow sudah Running (tombol hijau), 2) Port sudah ditambahkan di Tools → Ports sesuai port yang dipakai aplikasi, 3) Cek log di terminal apakah ada error saat server start."
  },
  {
    q: "Apa bedanya Dev URL dan Published URL?",
    a: "Dev URL adalah URL sementara yang aktif selama Anda di workspace — akan sleep jika tidak ada aktivitas. Published URL adalah URL permanen yang aktif 24/7. Klik Publish di Tools → Domains untuk mendapat URL permanen."
  },
  {
    q: "Bagaimana cara pakai database?",
    a: "Buka Tools → Database. Pilih MySQL atau PostgreSQL, lalu klik 'Buat Database'. Kredensial (host, user, password) akan otomatis tersedia sebagai environment variable di aplikasi Anda."
  },
  {
    q: "Cara menyimpan API key agar aman?",
    a: "Jangan simpan API key di dalam kode! Gunakan Tools → Secrets. Tambahkan key-value, nanti bisa diakses lewat environment variable di aplikasi Anda, contoh: process.env.API_KEY (Node.js) atau os.environ['API_KEY'] (Python)."
  },
  {
    q: "Bagaimana cara deploy dengan domain sendiri?",
    a: "1) Publish workspace dulu (Tools → Domains → Publish). 2) Klik 'Hubungkan Domain', masukkan domain Anda. 3) Set DNS record yang ditampilkan di Cloudflare/provider domain Anda. 4) Klik 'Cek DNS'. Domain aktif dalam beberapa menit."
  },
  {
    q: "Port apa yang harus dibuka di VPS?",
    a: "Cukup port 22 (SSH), 80 (HTTP), dan 443 (HTTPS). Semua traffic workspace masuk lewat port 443 via reverse proxy Traefik. Port internal workspace (3000, 8080 dll) tidak perlu dibuka ke publik."
  },
  {
    q: "Apakah domain Cloudflare bisa dipakai?",
    a: "Ya, Cloudflare sangat direkomendasikan! Lebih aman (DDoS protection), lebih cepat (CDN), dan wildcard subdomain langsung support. Set SSL mode ke 'Full (Strict)' di dashboard Cloudflare."
  },
  {
    q: "Kenapa terminal saya tidak mau input?",
    a: "Klik area terminal sekali untuk memfokuskan cursor, lalu coba ketik. Jika masih tidak bisa, coba buka terminal baru dengan tombol + di tab terminal."
  },
];

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-sm font-medium">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{children}</div>}
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-card/50 border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={guide.color}>{guide.icon}</span>
            <span>{guide.language}</span>
            <Badge variant="outline" className="text-[10px]">{guide.steps.length} langkah</Badge>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-4">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                {i < guide.steps.length - 1 && <div className="w-px flex-1 bg-border/30 my-1" />}
              </div>
              <div className="flex-1 pb-2 min-w-0">
                <p className="text-sm font-semibold mb-1">{step.title}</p>
                {step.desc && <p className="text-xs text-muted-foreground mb-2 whitespace-pre-line">{step.desc}</p>}
                {step.code && (
                  <pre className="bg-[#0d1117] border border-border/30 rounded-md p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                    {step.code}
                  </pre>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-xs text-green-400">Website Anda sudah siap! Klik Publish untuk online 24/7.</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Panduan & Dokumentasi
        </h1>
        <p className="text-muted-foreground mt-2">
          Semua yang perlu Anda tahu untuk memulai hosting website di platform ini.
        </p>
      </div>

      {/* Quick overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Terminal className="w-5 h-5" />, label: "Editor + Terminal", desc: "Coding langsung di browser" },
          { icon: <Workflow className="w-5 h-5" />, label: "Workflows", desc: "Jalankan server Anda" },
          { icon: <Server className="w-5 h-5" />, label: "Port Manager", desc: "Expose port ke URL publik" },
          { icon: <Globe className="w-5 h-5" />, label: "Publish", desc: "Online 24/7 dengan 1 klik" },
        ].map((item, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="text-primary">{item.icon}</div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="opacity-30" />

      {/* Language guides */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Panduan Per Bahasa</h2>
        <p className="text-sm text-muted-foreground">Pilih bahasa yang Anda gunakan untuk melihat langkah-langkah memulai.</p>
        <div className="space-y-3">
          {guides.map(guide => <GuideCard key={guide.id} guide={guide} />)}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Tools explanation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Penjelasan Tools</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Workflow className="w-4 h-4" />,
              title: "Workflows",
              desc: "Konfigurasi perintah untuk menjalankan aplikasi Anda. Mirip seperti npm start atau python app.py yang dijalankan otomatis. Anda bisa punya beberapa workflow — misalnya satu untuk dev server, satu untuk build."
            },
            {
              icon: <Server className="w-4 h-4" />,
              title: "Ports",
              desc: "Ketika aplikasi Anda berjalan di port tertentu (misal 3000), tambahkan di sini untuk mendapat URL publik otomatis. Contoh: port 3000 → https://ws-abc.preview.domain.com"
            },
            {
              icon: <Database className="w-4 h-4" />,
              title: "Database",
              desc: "Provision database MySQL atau PostgreSQL dengan 1 klik. Setiap workspace punya database terisolasi sendiri. Kredensial otomatis tersedia sebagai environment variable."
            },
            {
              icon: <Key className="w-4 h-4" />,
              title: "Secrets",
              desc: "Simpan API key, token, dan konfigurasi sensitif di sini. Terenkripsi AES-256. Di-inject ke aplikasi sebagai environment variable — tidak pernah muncul di kode atau log."
            },
            {
              icon: <Globe className="w-4 h-4" />,
              title: "Domains",
              desc: "Hubungkan domain Anda sendiri atau gunakan subdomain gratis. Support Cloudflare. SSL otomatis via Let's Encrypt. Set CNAME record di Cloudflare → verifikasi → aktif dalam menit."
            },
            {
              icon: <Info className="w-4 h-4" />,
              title: "Monitoring",
              desc: "Pantau CPU, RAM, disk, dan network workspace Anda secara real-time. Update setiap 5 detik. Berguna untuk memastikan aplikasi tidak memakan terlalu banyak resource."
            },
          ].map((item, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-primary">{item.icon}</span>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">FAQ — Pertanyaan Sering</h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <Collapsible key={i} title={item.q}>
              <p>{item.a}</p>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Port info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Port VPS yang Wajib Dibuka</h2>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Port</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Protokol</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Fungsi</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {[
                    { port: "22", proto: "TCP", func: "SSH — remote ke VPS", required: true },
                    { port: "80", proto: "TCP", func: "HTTP — redirect ke HTTPS + SSL challenge", required: true },
                    { port: "443", proto: "TCP", func: "HTTPS — semua traffic website (Traefik)", required: true },
                    { port: "443", proto: "UDP", func: "HTTP/3 QUIC — performa lebih baik", required: false },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 font-mono text-primary">{row.port}</td>
                      <td className="py-2 text-muted-foreground">{row.proto}</td>
                      <td className="py-2">{row.func}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={`text-[10px] ${row.required ? "text-green-400 border-green-500/30" : "text-muted-foreground"}`}>
                          {row.required ? "Wajib" : "Opsional"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-300 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Port workspace internal (3000, 8080 dll) <strong>tidak perlu dibuka</strong> di firewall. Semua traffic masuk lewat port 443 via Traefik reverse proxy. Ini lebih aman karena attack surface jauh lebih kecil.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pb-8" />
    </div>
  );
}
