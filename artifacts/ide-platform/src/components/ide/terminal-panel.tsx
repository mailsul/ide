import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { TerminalSquare, Plus, X } from "lucide-react";

const LANGUAGE_STARTERS: Record<string, string[]> = {
  nodejs:   ["node --version", "npm --version", 'echo "Siap! Jalankan: node index.js atau npm start"'],
  python:   ["python3 --version", "pip3 --version", 'echo "Siap! Jalankan: python3 app.py"'],
  php:      ["php --version", "composer --version", 'echo "Siap! Jalankan: php -S 0.0.0.0:8000"'],
  go:       ["go version", 'echo "Siap! Jalankan: go run main.go"'],
  rust:     ["rustc --version", "cargo --version", 'echo "Siap! Jalankan: cargo run"'],
  java:     ["java --version", "mvn --version", 'echo "Siap! Jalankan: java -jar app.jar"'],
  ruby:     ["ruby --version", "gem --version", 'echo "Siap! Jalankan: ruby app.rb"'],
  deno:     ["deno --version", 'echo "Siap! Jalankan: deno run --allow-net main.ts"'],
  bash:     ["bash --version", 'echo "Siap! Jalankan: bash script.sh"'],
  html:     ['echo "Static site — buka via Preview panel"', "ls -la"],
  default:  ["ls -la", 'echo "Selamat datang di workspace!"'],
};

function createTerminal(language: string): Terminal {
  const term = new Terminal({
    theme: {
      background: "#0d1117",
      foreground: "#e6edf3",
      cursor: "#58a6ff",
      black: "#484f58",
      green: "#3fb950",
      yellow: "#d29922",
      blue: "#58a6ff",
      cyan: "#39c5cf",
      white: "#b1bac4",
      brightBlack: "#6e7681",
      brightGreen: "#56d364",
      brightWhite: "#f0f6fc",
    },
    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
    fontSize: 13,
    lineHeight: 1.5,
    cursorBlink: true,
    cursorStyle: "block",
    scrollback: 1000,
  });

  return term;
}

function writeWithDelay(term: Terminal, lines: string[], onDone?: () => void) {
  let i = 0;
  const next = () => {
    if (i >= lines.length) {
      onDone?.();
      return;
    }
    const line = lines[i++];
    term.write(line);
    setTimeout(next, 60);
  };
  next();
}

function simulateSession(term: Terminal, language: string) {
  const lang = language?.toLowerCase() || "default";
  const starters = LANGUAGE_STARTERS[lang] || LANGUAGE_STARTERS.default;

  const prompt = "\r\n\x1b[32m~/workspace\x1b[0m \x1b[34m$\x1b[0m ";

  const lines: string[] = [
    "\x1b[1;34m╔══════════════════════════════════════════╗\r\n",
    "\x1b[1;34m║\x1b[0m  \x1b[1mWorkspace Terminal\x1b[0m                    \x1b[1;34m║\r\n",
    "\x1b[1;34m╚══════════════════════════════════════════╝\x1b[0m\r\n",
    `\x1b[90mBahasa: \x1b[36m${language || "bash"}\x1b[0m\r\n`,
    "\x1b[90m─────────────────────────────────────────\x1b[0m\r\n",
  ];

  writeWithDelay(term, lines, () => {
    let si = 0;
    const runNext = () => {
      if (si >= starters.length) {
        term.write(prompt);
        return;
      }
      const cmd = starters[si++];
      term.write(prompt);
      // Type command char by char
      let ci = 0;
      const typeChar = () => {
        if (ci < cmd.length) {
          term.write(cmd[ci++]);
          setTimeout(typeChar, 25);
        } else {
          term.write("\r\n");
          // Simulate output
          setTimeout(() => {
            term.write(`\x1b[90m[output simulasi — workspace nyata akan terhubung via WebSocket]\x1b[0m\r\n`);
            setTimeout(runNext, 300);
          }, 200);
        }
      };
      typeChar();
    };
    runNext();
  });
}

interface TermTab {
  id: string;
  label: string;
  term: Terminal;
  fitAddon: FitAddon;
}

export function TerminalPanel({ workspaceId, language }: { workspaceId: string; language: string }) {
  const [tabs, setTabs] = useState<TermTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const initializedRef = useRef<Set<string>>(new Set());

  // Create first terminal on mount
  useEffect(() => {
    if (tabs.length === 0) {
      addTab();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount terminal into DOM when tab becomes active
  useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const container = containerRefs.current[activeTabId];
    if (!container) return;

    if (!initializedRef.current.has(activeTabId)) {
      initializedRef.current.add(activeTabId);
      tab.term.open(container);
      tab.fitAddon.fit();
      simulateSession(tab.term, language);

      // Handle user input
      tab.term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        if (domEvent.keyCode === 13) {
          tab.term.write("\r\n\x1b[32m~/workspace\x1b[0m \x1b[34m$\x1b[0m ");
        } else if (domEvent.keyCode === 8) {
          tab.term.write("\b \b");
        } else if (printable) {
          tab.term.write(key);
        }
      });
    } else {
      tab.fitAddon.fit();
    }

    const observer = new ResizeObserver(() => tab.fitAddon.fit());
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeTabId, tabs, language]);

  function addTab() {
    const id = `term-${Date.now()}`;
    const term = createTerminal(language);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    const label = `Shell ${tabs.length + 1}`;
    setTabs(prev => [...prev, { id, label, term, fitAddon }]);
    setActiveTabId(id);
  }

  function closeTab(id: string) {
    const tab = tabs.find(t => t.id === id);
    tab?.term.dispose();
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[#21262d] bg-[#161b22] shrink-0 h-8">
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 h-8 text-xs cursor-pointer select-none group border-r border-[#21262d] shrink-0 transition-colors
                ${activeTabId === tab.id
                  ? "bg-[#0d1117] text-[#e6edf3]"
                  : "bg-transparent text-[#7d8590] hover:text-[#e6edf3]"
                }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <TerminalSquare className="w-3 h-3" />
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                  onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="px-2 h-8 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors shrink-0"
          onClick={addTab}
          title="New terminal"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal containers */}
      <div className="flex-1 relative overflow-hidden">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className="absolute inset-0 p-2"
            style={{ display: activeTabId === tab.id ? "block" : "none" }}
            ref={el => { containerRefs.current[tab.id] = el; }}
          />
        ))}
        {tabs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#7d8590]">
            <TerminalSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Klik + untuk buka terminal</p>
          </div>
        )}
      </div>
    </div>
  );
}
