/**
 * Workspace Template Registry
 *
 * Setiap template mendefinisikan:
 * - id: dipakai sebagai nilai `language` di DB (untuk backward-compat)
 * - runtimes: bahasa/tool yang tersedia
 * - runnerConfig: perintah default di .workspace.toml
 * - packageManagers: package manager yang tersedia di Packager panel
 * - scaffoldFiles: file awal yang di-generate saat workspace dibuat
 *
 * Semua template memakai image yang sama (platform/workspace-base:latest)
 * yang sudah punya semua runtime — template hanya memberi konteks & konfigurasi.
 *
 * Docker-in-Docker: workspace container di-launch dengan mount:
 *   -v /var/run/docker.sock:/var/run/docker.sock
 * Sehingga `docker` CLI di dalam workspace bisa berbicara ke daemon host.
 */

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: "backend" | "frontend" | "fullstack" | "devops" | "language";
  runtimes: string[];          // runtime yang dipakai (label untuk UI)
  icon: string;                // emoji icon
  color: string;               // tailwind color class
  packageManagers: PackageManager[];
  defaultRunCommand: string;
  defaultPort?: number;
  popular?: boolean;
  dind?: boolean;              // apakah butuh Docker socket mount
}

export interface PackageManager {
  id: string;
  name: string;
  installCmd: string;          // template: "{pm} install {pkg}"
  listCmd: string;
  runtime: string;
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  // ─── Blank workspace ───────────────────────────────────────────────────────
  {
    id: "empty",
    name: "Empty",
    description: "Workspace kosong tanpa file awal atau runtime project. Mulai dari nol.",
    category: "language",
    runtimes: [],
    icon: "□",
    color: "text-muted-foreground",
    packageManagers: [],
    defaultRunCommand: "",
  },

  // ─── Backend Single-Language ───────────────────────────────────────────────
  {
    id: "nodejs",
    name: "Node.js",
    description: "JavaScript / TypeScript runtime. Express, Fastify, NestJS, dan lainnya.",
    category: "backend",
    runtimes: ["Node.js 20", "npm", "pnpm", "yarn"],
    icon: "⬢",
    color: "text-green-500",
    packageManagers: [
      { id: "npm", name: "npm", installCmd: "npm install {pkg}", listCmd: "npm list --depth=0", runtime: "nodejs" },
      { id: "pnpm", name: "pnpm", installCmd: "pnpm add {pkg}", listCmd: "pnpm list --depth=0", runtime: "nodejs" },
      { id: "yarn", name: "yarn", installCmd: "yarn add {pkg}", listCmd: "yarn list --depth=1", runtime: "nodejs" },
    ],
    defaultRunCommand: "node index.js",
    defaultPort: 3000,
    popular: true,
  },
  {
    id: "python",
    name: "Python",
    description: "Python 3.11. Flask, FastAPI, Django, data science, scripting.",
    category: "backend",
    runtimes: ["Python 3.11", "pip", "poetry"],
    icon: "🐍",
    color: "text-blue-400",
    packageManagers: [
      { id: "pip", name: "pip", installCmd: "pip install {pkg}", listCmd: "pip list", runtime: "python" },
      { id: "poetry", name: "poetry", installCmd: "poetry add {pkg}", listCmd: "poetry show", runtime: "python" },
    ],
    defaultRunCommand: "python main.py",
    defaultPort: 8000,
    popular: true,
  },
  {
    id: "php",
    name: "PHP",
    description: "PHP 8.2 + Composer. Laravel, Symfony, WordPress, atau plain PHP.",
    category: "backend",
    runtimes: ["PHP 8.2", "Composer"],
    icon: "🐘",
    color: "text-purple-400",
    packageManagers: [
      { id: "composer", name: "Composer", installCmd: "composer require {pkg}", listCmd: "composer show", runtime: "php" },
    ],
    defaultRunCommand: "php -S 0.0.0.0:8080",
    defaultPort: 8080,
  },
  {
    id: "go",
    name: "Go",
    description: "Go 1.21. Gin, Echo, Fiber — performa tinggi dan concurrency native.",
    category: "backend",
    runtimes: ["Go 1.21"],
    icon: "🔵",
    color: "text-cyan-400",
    packageManagers: [
      { id: "gomod", name: "go mod", installCmd: "go get {pkg}", listCmd: "go list -m all", runtime: "go" },
    ],
    defaultRunCommand: "go run .",
    defaultPort: 8080,
  },
  {
    id: "rust",
    name: "Rust",
    description: "Rust + Cargo. Actix-Web, Axum — performa maksimum dan memory-safe.",
    category: "backend",
    runtimes: ["Rust (stable)", "Cargo"],
    icon: "⚙️",
    color: "text-orange-400",
    packageManagers: [
      { id: "cargo", name: "Cargo", installCmd: "cargo add {pkg}", listCmd: "cargo tree --depth=1", runtime: "rust" },
    ],
    defaultRunCommand: "cargo run",
    defaultPort: 8080,
  },
  {
    id: "java",
    name: "Java",
    description: "OpenJDK 21 + Maven. Spring Boot, Quarkus, Micronaut.",
    category: "backend",
    runtimes: ["OpenJDK 21", "Maven"],
    icon: "☕",
    color: "text-red-400",
    packageManagers: [
      { id: "maven", name: "Maven", installCmd: "# Tambah ke pom.xml\n<dependency>\n  <groupId>{pkg}</groupId>\n</dependency>", listCmd: "mvn dependency:list", runtime: "java" },
    ],
    defaultRunCommand: "mvn spring-boot:run",
    defaultPort: 8080,
  },
  {
    id: "ruby",
    name: "Ruby",
    description: "Ruby + Bundler. Rails, Sinatra, Hanami.",
    category: "backend",
    runtimes: ["Ruby", "Bundler", "gem"],
    icon: "💎",
    color: "text-red-500",
    packageManagers: [
      { id: "bundler", name: "Bundler", installCmd: "bundle add {pkg}", listCmd: "bundle list", runtime: "ruby" },
      { id: "gem", name: "gem", installCmd: "gem install {pkg}", listCmd: "gem list", runtime: "ruby" },
    ],
    defaultRunCommand: "ruby app.rb",
    defaultPort: 4567,
  },
  {
    id: "deno",
    name: "Deno",
    description: "Deno runtime — TypeScript native, secure by default, built-in toolchain.",
    category: "backend",
    runtimes: ["Deno"],
    icon: "🦕",
    color: "text-white",
    packageManagers: [
      { id: "deno_cache", name: "deno cache", installCmd: "deno cache {pkg}", listCmd: "deno info", runtime: "deno" },
    ],
    defaultRunCommand: "deno run --allow-net main.ts",
    defaultPort: 8000,
  },
  {
    id: "dotnet",
    name: ".NET",
    description: ".NET SDK. ASP.NET Core, Blazor, console apps, microservices.",
    category: "backend",
    runtimes: [".NET SDK"],
    icon: "🔷",
    color: "text-purple-600",
    packageManagers: [
      { id: "nuget", name: "NuGet", installCmd: "dotnet add package {pkg}", listCmd: "dotnet list package", runtime: "dotnet" },
    ],
    defaultRunCommand: "dotnet run",
    defaultPort: 5000,
  },

  // ─── Frontend ──────────────────────────────────────────────────────────────
  {
    id: "html",
    name: "HTML / CSS",
    description: "Static website. Vanilla HTML, CSS, JavaScript — tanpa framework.",
    category: "frontend",
    runtimes: ["Node.js 20 (dev server)"],
    icon: "🌐",
    color: "text-orange-500",
    packageManagers: [
      { id: "npm", name: "npm", installCmd: "npm install {pkg}", listCmd: "npm list --depth=0", runtime: "nodejs" },
    ],
    defaultRunCommand: "npx serve . -p 3000",
    defaultPort: 3000,
  },
  {
    id: "bash",
    name: "Bash / Shell",
    description: "Skrip shell, automation, devops tasks, atau eksplorasi Linux.",
    category: "language",
    runtimes: ["Bash", "curl", "git", "htop"],
    icon: "🖥️",
    color: "text-gray-400",
    packageManagers: [
      { id: "apt", name: "apt", installCmd: "apt-get install -y {pkg}", listCmd: "dpkg --list | grep ^ii", runtime: "bash" },
    ],
    defaultRunCommand: "bash main.sh",
  },
  {
    id: "cpp",
    name: "C++",
    description: "C++17/20 dengan GCC dan Clang. Build dengan CMake atau Makefile.",
    category: "language",
    runtimes: ["GCC", "Clang", "CMake", "Make"],
    icon: "⚡",
    color: "text-blue-600",
    packageManagers: [
      { id: "apt", name: "apt", installCmd: "apt-get install -y lib{pkg}-dev", listCmd: "dpkg --list | grep ^ii", runtime: "bash" },
    ],
    defaultRunCommand: "g++ -o main main.cpp && ./main",
  },

  // ─── Docker-in-Docker templates ────────────────────────────────────────────
  {
    id: "docker",
    name: "Docker",
    description: "Docker CLI penuh di dalam workspace. Build images, jalankan Compose, manage containers — terhubung ke daemon host via socket.",
    category: "devops",
    runtimes: ["Docker CLI", "Docker Compose"],
    icon: "🐳",
    color: "text-blue-500",
    packageManagers: [
      { id: "apt", name: "apt", installCmd: "apt-get install -y {pkg}", listCmd: "dpkg --list | grep ^ii", runtime: "bash" },
    ],
    defaultRunCommand: "docker compose up",
    popular: true,
    dind: true,
  },
  {
    id: "docker-node",
    name: "Docker + Node.js",
    description: "Node.js development dengan Docker. Build & deploy app sebagai container. Ideal untuk microservices.",
    category: "devops",
    runtimes: ["Node.js 20", "Docker CLI", "Docker Compose", "npm"],
    icon: "🐳",
    color: "text-teal-400",
    packageManagers: [
      { id: "npm", name: "npm", installCmd: "npm install {pkg}", listCmd: "npm list --depth=0", runtime: "nodejs" },
      { id: "pnpm", name: "pnpm", installCmd: "pnpm add {pkg}", listCmd: "pnpm list --depth=0", runtime: "nodejs" },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 3000,
    popular: true,
    dind: true,
  },
  {
    id: "docker-python",
    name: "Docker + Python",
    description: "Python development dengan Docker. FastAPI/Flask di container, mudah di-scale dan di-deploy.",
    category: "devops",
    runtimes: ["Python 3.11", "Docker CLI", "Docker Compose", "pip"],
    icon: "🐳",
    color: "text-green-400",
    packageManagers: [
      { id: "pip", name: "pip", installCmd: "pip install {pkg}", listCmd: "pip list", runtime: "python" },
      { id: "poetry", name: "poetry", installCmd: "poetry add {pkg}", listCmd: "poetry show", runtime: "python" },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 8000,
    dind: true,
  },

  // ─── Multi-language / Fullstack templates ──────────────────────────────────
  {
    id: "fullstack",
    name: "Full Stack",
    description: "Node.js (frontend) + Python (backend) + Docker. Semua runtime tersedia di 1 workspace. Cocok untuk proyek besar.",
    category: "fullstack",
    runtimes: ["Node.js 20", "Python 3.11", "Docker CLI", "npm", "pip"],
    icon: "🚀",
    color: "text-violet-400",
    packageManagers: [
      { id: "npm", name: "npm", installCmd: "npm install {pkg}", listCmd: "npm list --depth=0", runtime: "nodejs" },
      { id: "pip", name: "pip", installCmd: "pip install {pkg}", listCmd: "pip list", runtime: "python" },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 3000,
    popular: true,
    dind: true,
  },
  {
    id: "node-python",
    name: "Node.js + Python",
    description: "Kombinasi Node.js dan Python. Data processing (Python) + API/web (Node.js) dalam 1 workspace.",
    category: "fullstack",
    runtimes: ["Node.js 20", "Python 3.11", "npm", "pip"],
    icon: "⚡",
    color: "text-amber-400",
    packageManagers: [
      { id: "npm", name: "npm", installCmd: "npm install {pkg}", listCmd: "npm list --depth=0", runtime: "nodejs" },
      { id: "pip", name: "pip", installCmd: "pip install {pkg}", listCmd: "pip list", runtime: "python" },
    ],
    defaultRunCommand: "node index.js",
    defaultPort: 3000,
  },
];

/** Get template by id — fallback ke nodejs jika tidak ditemukan */
export function getTemplate(id: string): WorkspaceTemplate {
  return WORKSPACE_TEMPLATES.find(t => t.id === id)
    ?? WORKSPACE_TEMPLATES.find(t => t.id === "nodejs")!;
}

/** Group templates by category */
export function groupByCategory(templates: WorkspaceTemplate[]) {
  const groups: Record<string, WorkspaceTemplate[]> = {};
  for (const t of templates) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  }
  return groups;
}

export const CATEGORY_LABELS: Record<string, string> = {
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Full Stack",
  devops: "DevOps / Docker",
  language: "Languages",
};
