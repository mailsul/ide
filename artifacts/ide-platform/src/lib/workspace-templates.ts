/**
 * Workspace Template Registry — Frontend
 * Mirror dari docker/workspace-templates/templates.ts
 * Dipakai oleh new-workspace picker dan packager panel.
 */

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: "backend" | "frontend" | "fullstack" | "devops" | "language";
  runtimes: string[];
  icon: string;
  badgeColors: string[];     // tailwind bg-color classes untuk setiap runtime badge
  packageManagers: PackageManagerDef[];
  defaultRunCommand: string;
  defaultPort?: number;
  popular?: boolean;
  dind?: boolean;            // perlu Docker socket mount
}

export interface PackageManagerDef {
  id: string;
  name: string;
  runtime: "nodejs" | "python" | "php" | "go" | "rust" | "java" | "ruby" | "deno" | "dotnet" | "bash";
  installCmd: (pkg: string) => string;
  listCmd: string;
  devInstallCmd?: (pkg: string) => string;
  commonPackages: string[];
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  // ─── Backend Single-Language ───────────────────────────────────────────────
  {
    id: "nodejs",
    name: "Node.js",
    description: "JavaScript / TypeScript runtime. Express, Fastify, NestJS, dan lainnya.",
    category: "backend",
    runtimes: ["Node.js 20", "npm"],
    icon: "⬢",
    badgeColors: ["bg-green-500/20 text-green-400 border-green-500/30"],
    packageManagers: [
      {
        id: "npm", name: "npm", runtime: "nodejs",
        installCmd: (p) => `npm install ${p}`,
        devInstallCmd: (p) => `npm install --save-dev ${p}`,
        listCmd: "npm list --depth=0",
        commonPackages: ["express", "axios", "dotenv", "lodash", "typescript", "jest", "cors", "body-parser"],
      },
      {
        id: "pnpm", name: "pnpm", runtime: "nodejs",
        installCmd: (p) => `pnpm add ${p}`,
        devInstallCmd: (p) => `pnpm add -D ${p}`,
        listCmd: "pnpm list --depth=0",
        commonPackages: ["express", "axios", "dotenv", "lodash", "typescript", "jest"],
      },
      {
        id: "yarn", name: "yarn", runtime: "nodejs",
        installCmd: (p) => `yarn add ${p}`,
        devInstallCmd: (p) => `yarn add -D ${p}`,
        listCmd: "yarn list --depth=1",
        commonPackages: ["express", "axios", "dotenv", "lodash"],
      },
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
    runtimes: ["Python 3.11", "pip"],
    icon: "🐍",
    badgeColors: ["bg-blue-500/20 text-blue-400 border-blue-500/30"],
    packageManagers: [
      {
        id: "pip", name: "pip", runtime: "python",
        installCmd: (p) => `pip install ${p}`,
        listCmd: "pip list",
        commonPackages: ["flask", "fastapi", "uvicorn", "requests", "numpy", "pandas", "django", "sqlalchemy"],
      },
      {
        id: "poetry", name: "poetry", runtime: "python",
        installCmd: (p) => `poetry add ${p}`,
        listCmd: "poetry show",
        commonPackages: ["flask", "fastapi", "requests", "numpy", "pandas"],
      },
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
    badgeColors: ["bg-purple-500/20 text-purple-400 border-purple-500/30"],
    packageManagers: [
      {
        id: "composer", name: "Composer", runtime: "php",
        installCmd: (p) => `composer require ${p}`,
        listCmd: "composer show",
        commonPackages: ["laravel/framework", "slim/slim", "symfony/console", "monolog/monolog", "guzzlehttp/guzzle"],
      },
    ],
    defaultRunCommand: "php -S 0.0.0.0:8080",
    defaultPort: 8080,
  },
  {
    id: "go",
    name: "Go",
    description: "Go 1.21. Gin, Echo, Fiber — performa tinggi, concurrency native.",
    category: "backend",
    runtimes: ["Go 1.21"],
    icon: "🔵",
    badgeColors: ["bg-cyan-500/20 text-cyan-400 border-cyan-500/30"],
    packageManagers: [
      {
        id: "gomod", name: "go get", runtime: "go",
        installCmd: (p) => `go get ${p}`,
        listCmd: "go list -m all",
        commonPackages: ["github.com/gin-gonic/gin", "github.com/labstack/echo/v4", "gorm.io/gorm", "github.com/joho/godotenv"],
      },
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
    badgeColors: ["bg-orange-500/20 text-orange-400 border-orange-500/30"],
    packageManagers: [
      {
        id: "cargo", name: "Cargo", runtime: "rust",
        installCmd: (p) => `cargo add ${p}`,
        listCmd: "cargo tree --depth=1",
        commonPackages: ["tokio", "serde", "actix-web", "axum", "reqwest", "sqlx", "dotenv"],
      },
    ],
    defaultRunCommand: "cargo run",
    defaultPort: 8080,
  },
  {
    id: "java",
    name: "Java",
    description: "OpenJDK 21 + Maven. Spring Boot, Quarkus, microservices.",
    category: "backend",
    runtimes: ["OpenJDK 21", "Maven"],
    icon: "☕",
    badgeColors: ["bg-red-500/20 text-red-400 border-red-500/30"],
    packageManagers: [
      {
        id: "maven", name: "Maven (pom.xml)", runtime: "java",
        installCmd: (p) => `# Tambah ke pom.xml:\n# <dependency><groupId>...</groupId><artifactId>${p}</artifactId></dependency>`,
        listCmd: "mvn dependency:list",
        commonPackages: ["spring-boot-starter-web", "spring-boot-starter-data-jpa", "lombok", "spring-boot-starter-test"],
      },
    ],
    defaultRunCommand: "mvn spring-boot:run",
    defaultPort: 8080,
  },
  {
    id: "ruby",
    name: "Ruby",
    description: "Ruby + Bundler. Rails, Sinatra, Hanami.",
    category: "backend",
    runtimes: ["Ruby", "Bundler"],
    icon: "💎",
    badgeColors: ["bg-red-500/20 text-red-400 border-red-500/30"],
    packageManagers: [
      {
        id: "bundler", name: "Bundler", runtime: "ruby",
        installCmd: (p) => `bundle add ${p}`,
        listCmd: "bundle list",
        commonPackages: ["sinatra", "rails", "activerecord", "pg", "puma", "dotenv"],
      },
    ],
    defaultRunCommand: "ruby app.rb",
    defaultPort: 4567,
  },
  {
    id: "deno",
    name: "Deno",
    description: "Deno runtime — TypeScript native, secure by default.",
    category: "backend",
    runtimes: ["Deno"],
    icon: "🦕",
    badgeColors: ["bg-slate-500/20 text-slate-300 border-slate-500/30"],
    packageManagers: [
      {
        id: "deno_cache", name: "deno cache", runtime: "deno",
        installCmd: (p) => `# Import langsung di kode:\n# import ... from "${p}"`,
        listCmd: "deno info",
        commonPackages: ["https://deno.land/x/oak/mod.ts", "https://deno.land/x/dotenv/mod.ts"],
      },
    ],
    defaultRunCommand: "deno run --allow-net main.ts",
    defaultPort: 8000,
  },
  {
    id: "dotnet",
    name: ".NET",
    description: ".NET SDK. ASP.NET Core, Blazor, console apps.",
    category: "backend",
    runtimes: [".NET SDK"],
    icon: "🔷",
    badgeColors: ["bg-purple-500/20 text-purple-600 border-purple-500/30"],
    packageManagers: [
      {
        id: "nuget", name: "NuGet", runtime: "dotnet",
        installCmd: (p) => `dotnet add package ${p}`,
        listCmd: "dotnet list package",
        commonPackages: ["Microsoft.EntityFrameworkCore", "Newtonsoft.Json", "AutoMapper", "Serilog", "FluentValidation"],
      },
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
    badgeColors: ["bg-orange-500/20 text-orange-400 border-orange-500/30"],
    packageManagers: [
      {
        id: "npm", name: "npm", runtime: "nodejs",
        installCmd: (p) => `npm install ${p}`,
        listCmd: "npm list --depth=0",
        commonPackages: ["vite", "parcel", "webpack", "live-server"],
      },
    ],
    defaultRunCommand: "npx serve . -p 3000",
    defaultPort: 3000,
  },
  {
    id: "bash",
    name: "Bash / Shell",
    description: "Skrip shell, automation, devops tasks, eksplorasi Linux.",
    category: "language",
    runtimes: ["Bash", "curl", "git"],
    icon: "🖥️",
    badgeColors: ["bg-gray-500/20 text-gray-400 border-gray-500/30"],
    packageManagers: [
      {
        id: "apt", name: "apt", runtime: "bash",
        installCmd: (p) => `apt-get install -y ${p}`,
        listCmd: "dpkg --list | grep ^ii",
        commonPackages: ["jq", "curl", "wget", "htop", "rsync", "ncdu"],
      },
    ],
    defaultRunCommand: "bash main.sh",
  },
  {
    id: "cpp",
    name: "C++",
    description: "C++17/20 dengan GCC dan Clang. CMake atau Makefile.",
    category: "language",
    runtimes: ["GCC", "Clang", "CMake"],
    icon: "⚡",
    badgeColors: ["bg-blue-500/20 text-blue-600 border-blue-500/30"],
    packageManagers: [
      {
        id: "apt", name: "apt (lib)", runtime: "bash",
        installCmd: (p) => `apt-get install -y lib${p}-dev`,
        listCmd: "dpkg --list | grep ^ii",
        commonPackages: ["libboost-all-dev", "libeigen3-dev", "libssl-dev", "libcurl4-openssl-dev"],
      },
    ],
    defaultRunCommand: "g++ -o main main.cpp && ./main",
  },

  // ─── Docker-in-Docker ──────────────────────────────────────────────────────
  {
    id: "docker",
    name: "Docker",
    description: "Docker CLI penuh di workspace. Build images, jalankan Compose — terhubung ke daemon host via socket.",
    category: "devops",
    runtimes: ["Docker CLI", "Docker Compose"],
    icon: "🐳",
    badgeColors: ["bg-blue-500/20 text-blue-400 border-blue-500/30"],
    packageManagers: [
      {
        id: "apt", name: "apt", runtime: "bash",
        installCmd: (p) => `apt-get install -y ${p}`,
        listCmd: "dpkg --list | grep ^ii",
        commonPackages: ["jq", "curl", "wget", "make"],
      },
    ],
    defaultRunCommand: "docker compose up",
    popular: true,
    dind: true,
  },
  {
    id: "docker-node",
    name: "Docker + Node.js",
    description: "Node.js dev + Docker untuk containerized deployment. Ideal untuk microservices.",
    category: "devops",
    runtimes: ["Node.js 20", "Docker CLI", "Docker Compose"],
    icon: "🐳",
    badgeColors: [
      "bg-green-500/20 text-green-400 border-green-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ],
    packageManagers: [
      {
        id: "npm", name: "npm", runtime: "nodejs",
        installCmd: (p) => `npm install ${p}`,
        devInstallCmd: (p) => `npm install --save-dev ${p}`,
        listCmd: "npm list --depth=0",
        commonPackages: ["express", "axios", "dotenv", "typescript", "nodemon"],
      },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 3000,
    popular: true,
    dind: true,
  },
  {
    id: "docker-python",
    name: "Docker + Python",
    description: "Python dev + Docker. FastAPI/Flask di container — mudah di-scale dan di-deploy.",
    category: "devops",
    runtimes: ["Python 3.11", "Docker CLI", "Docker Compose"],
    icon: "🐳",
    badgeColors: [
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "bg-green-500/20 text-green-400 border-green-500/30",
    ],
    packageManagers: [
      {
        id: "pip", name: "pip", runtime: "python",
        installCmd: (p) => `pip install ${p}`,
        listCmd: "pip list",
        commonPackages: ["fastapi", "uvicorn", "flask", "requests", "sqlalchemy", "pydantic"],
      },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 8000,
    dind: true,
  },

  // ─── Multi-language / Fullstack ────────────────────────────────────────────
  {
    id: "fullstack",
    name: "Full Stack",
    description: "Node.js (frontend) + Python (backend) + Docker. Semua runtime dalam 1 workspace.",
    category: "fullstack",
    runtimes: ["Node.js 20", "Python 3.11", "Docker CLI"],
    icon: "🚀",
    badgeColors: [
      "bg-green-500/20 text-green-400 border-green-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    ],
    packageManagers: [
      {
        id: "npm", name: "npm", runtime: "nodejs",
        installCmd: (p) => `npm install ${p}`,
        devInstallCmd: (p) => `npm install --save-dev ${p}`,
        listCmd: "npm list --depth=0",
        commonPackages: ["react", "express", "axios", "vite", "typescript"],
      },
      {
        id: "pip", name: "pip", runtime: "python",
        installCmd: (p) => `pip install ${p}`,
        listCmd: "pip list",
        commonPackages: ["fastapi", "uvicorn", "requests", "sqlalchemy", "pydantic"],
      },
    ],
    defaultRunCommand: "docker compose up --build",
    defaultPort: 3000,
    popular: true,
    dind: true,
  },
  {
    id: "node-python",
    name: "Node.js + Python",
    description: "Kombinasi Node.js dan Python. Data processing (Python) + web server (Node.js).",
    category: "fullstack",
    runtimes: ["Node.js 20", "Python 3.11"],
    icon: "⚡",
    badgeColors: [
      "bg-green-500/20 text-green-400 border-green-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ],
    packageManagers: [
      {
        id: "npm", name: "npm", runtime: "nodejs",
        installCmd: (p) => `npm install ${p}`,
        listCmd: "npm list --depth=0",
        commonPackages: ["express", "axios", "typescript"],
      },
      {
        id: "pip", name: "pip", runtime: "python",
        installCmd: (p) => `pip install ${p}`,
        listCmd: "pip list",
        commonPackages: ["requests", "numpy", "pandas", "scikit-learn"],
      },
    ],
    defaultRunCommand: "node index.js",
    defaultPort: 3000,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Full Stack",
  devops: "DevOps / Docker",
  language: "Languages",
};

export const CATEGORY_ORDER = ["fullstack", "devops", "backend", "frontend", "language"];

/** Get template by id, fallback ke nodejs */
export function getTemplate(id: string): WorkspaceTemplate {
  return WORKSPACE_TEMPLATES.find(t => t.id === id) ?? WORKSPACE_TEMPLATES[0];
}

/** Templates yang ditampilkan di popular section */
export const POPULAR_TEMPLATES = WORKSPACE_TEMPLATES.filter(t => t.popular);
