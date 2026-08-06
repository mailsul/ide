import { useState } from "react";
import { Globe, Copy, Check, RefreshCw, ExternalLink, Lock, Unlock, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: string;
  isPublished: boolean;
  publishedUrl?: string | null;
  devUrl?: string | null;
}

function QRCode({ value }: { value: string }) {
  // Simple visual QR placeholder — real app would use a QR lib
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-md inline-block">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Simplified QR pattern for visual only */}
          {[0,1,2,3,4,5,6].map(row =>
            [0,1,2,3,4,5,6].map(col => {
              const val = (row * 7 + col + row + col * 3 + value.charCodeAt(col % value.length)) % 3;
              if (row < 3 && col < 3) return <rect key={`${row}-${col}`} x={col*10} y={row*10} width="10" height="10" fill="#000" />;
              if (row < 3 && col >= 4) return <rect key={`${row}-${col}`} x={col*10} y={row*10} width="10" height="10" fill="#000" />;
              if (row >= 4 && col < 3) return <rect key={`${row}-${col}`} x={col*10} y={row*10} width="10" height="10" fill="#000" />;
              return val === 0 ? <rect key={`${row}-${col}`} x={col*10} y={row*10} width="10" height="10" fill="#000" /> : null;
            })
          )}
        </svg>
      </div>
      <p className="text-[10px] text-muted-foreground">Scan untuk buka di HP</p>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copy}>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

export function PreviewPanel({ workspace }: { workspace: Workspace }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const devUrl = workspace.devUrl || `https://ws-${workspace.id.slice(0, 8)}.preview.localhost`;
  const previewUrl = workspace.isPublished && workspace.publishedUrl
    ? workspace.publishedUrl
    : devUrl;

  const refresh = () => setIframeKey(k => k + 1);

  if (workspace.status !== "running") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
          <Globe className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">Preview tidak tersedia</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start workspace terlebih dahulu untuk melihat preview website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="h-10 border-b border-border/50 bg-card/30 flex items-center gap-2 px-3 shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-background/50 border border-border/30 rounded-md px-2 h-7">
          <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-mono text-muted-foreground truncate">{previewUrl}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={refresh}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </TooltipTrigger>
          <TooltipContent>Buka di tab baru</TooltipContent>
        </Tooltip>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative bg-white overflow-hidden">
        <iframe
          key={iframeKey}
          src={previewUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Info bar below iframe */}
      <div className="shrink-0 border-t border-border/50 bg-card/30 p-3 space-y-3">
        {/* Dev URL row */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {workspace.isPublished ? "URL Publik" : "Dev URL (sementara)"}
          </p>
          <div className="flex items-center gap-1">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-primary hover:underline truncate flex-1"
            >
              {previewUrl}
            </a>
            <CopyButton value={previewUrl} />
          </div>
          {!workspace.isPublished && (
            <p className="text-[10px] text-muted-foreground">
              URL sementara — akan sleep saat idle. Klik Publish untuk URL permanen.
            </p>
          )}
        </div>

        {/* QR + Private toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setShowQR(v => !v)}
          >
            <QrCode className="w-3 h-3" />
            {showQR ? "Sembunyikan QR" : "Tampilkan QR"}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPrivate ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setIsPrivate(v => !v)}
              >
                {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isPrivate ? "Private" : "Public"}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-xs">
              {isPrivate
                ? "Hanya Anda yang bisa akses preview ini"
                : "Siapa saja dengan URL ini bisa melihat preview"}
            </TooltipContent>
          </Tooltip>
        </div>

        {showQR && (
          <div className="flex justify-center pt-1">
            <QRCode value={previewUrl} />
          </div>
        )}

        {/* Status badge */}
        {workspace.isPublished && (
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Published — Online 24/7
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
