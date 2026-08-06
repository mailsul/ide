import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useGetWorkspace, useListFiles, useStartWorkspace, useStopWorkspace, getListFilesQueryKey, getGetWorkspaceQueryKey } from "@workspace/api-client-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Square, Globe, Settings, TerminalSquare, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { FileTree } from "@/components/ide/file-tree";
import { EditorPanel } from "@/components/ide/editor-panel";
import { TerminalPanel } from "@/components/ide/terminal-panel";
import { ToolsPanel } from "@/components/ide/tools-panel";
import { PreviewPanel } from "@/components/ide/preview-panel";
import { useQueryClient } from "@tanstack/react-query";

export default function WorkspaceIDE() {
  const [, params] = useRoute("/workspaces/:id");
  const id = params?.id;
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"preview" | "tools">("preview");

  const queryClient = useQueryClient();
  const { data: workspace, isLoading } = useGetWorkspace(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetWorkspaceQueryKey(id || ""),
      refetchInterval: (query) => {
        // Poll more frequently if status is changing
        const status = query.state.data?.status;
        if (status === "starting" || status === "stopping") return 2000;
        return 10000;
      }
    }
  });

  const { data: files } = useListFiles(id || "", {
    query: {
      enabled: !!id && workspace?.status === "running",
      queryKey: getListFilesQueryKey(id || "")
    }
  });

  const startMutation = useStartWorkspace();
  const stopMutation = useStopWorkspace();

  const handleStart = () => {
    if (!id) return;
    startMutation.mutate({ workspaceId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkspaceQueryKey(id) });
      }
    });
  };

  const handleStop = () => {
    if (!id) return;
    stopMutation.mutate({ workspaceId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkspaceQueryKey(id) });
      }
    });
  };

  const getStatusDot = (status?: string) => {
    switch (status) {
      case "running": return <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />;
      case "stopped": return <span className="w-2 h-2 rounded-full bg-gray-500" />;
      case "sleeping": return <span className="w-2 h-2 rounded-full bg-yellow-500" />;
      case "error": return <span className="w-2 h-2 rounded-full bg-red-500" />;
      case "starting": return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
      default: return <span className="w-2 h-2 rounded-full bg-gray-500" />;
    }
  };

  if (isLoading || !workspace) {
    return <div className="h-[100dvh] flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      {/* IDE Header */}
      <header className="h-12 border-b border-border/50 bg-card/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
            <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{workspace.name}</span>
            <Badge variant="outline" className="text-xs font-mono bg-background shadow-none">
              {getStatusDot(workspace.status)}
              <span className="ml-2 capitalize">{workspace.status}</span>
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {workspace.status === "stopped" || workspace.status === "sleeping" ? (
            <Button size="sm" variant="default" className="h-8 gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleStart} disabled={startMutation.isPending}>
              <Play className="w-3.5 h-3.5" /> Start
            </Button>
          ) : workspace.status === "running" ? (
            <Button size="sm" variant="secondary" className="h-8 gap-2" onClick={handleStop} disabled={stopMutation.isPending}>
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="h-8 gap-2" disabled>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {workspace.status}
            </Button>
          )}

          <div className="w-px h-4 bg-border mx-2" />
          
          <Button size="sm" variant={rightPanelTab === "preview" ? "secondary" : "ghost"} className="h-8 gap-2" onClick={() => setRightPanelTab("preview")}>
            <Globe className="w-3.5 h-3.5" /> Preview
          </Button>
          <Button size="sm" variant={rightPanelTab === "tools" ? "secondary" : "ghost"} className="h-8 gap-2" onClick={() => setRightPanelTab("tools")}>
            <Settings className="w-3.5 h-3.5" /> Tools
          </Button>
        </div>
      </header>

      {/* Main IDE Area */}
      <div className="flex-1 overflow-hidden">
        {workspace.status !== "running" ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card/30">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <TerminalSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Workspace is {workspace.status}</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start the workspace to access your files, terminal, and development environment.
            </p>
            <Button onClick={handleStart} size="lg" className="bg-green-600 hover:bg-green-700 text-white" disabled={startMutation.isPending || workspace.status === "starting"}>
              {startMutation.isPending || workspace.status === "starting" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting Environment...</> : <><Play className="mr-2 h-4 w-4" /> Boot Workspace</>}
            </Button>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar: File Tree */}
            <ResizablePanel defaultSize={15} minSize={10} maxSize={30} className="bg-sidebar">
              <FileTree 
                workspaceId={workspace.id} 
                files={files || []} 
                activeFile={activeFile} 
                onSelectFile={setActiveFile} 
              />
            </ResizablePanel>
            
            <ResizableHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors" />
            
            {/* Center: Editor + Bottom Terminal */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={75} minSize={30} className="bg-[#1e1e1e]">
                  <EditorPanel workspaceId={workspace.id} filePath={activeFile} />
                </ResizablePanel>
                <ResizableHandle className="h-1 bg-border/50 hover:bg-primary/50 transition-colors" />
                <ResizablePanel defaultSize={25} minSize={10} className="bg-[#1e1e1e] border-t border-border/10">
                  <TerminalPanel workspaceId={workspace.id} language={workspace.language} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors" />

            {/* Right Sidebar: Preview or Tools */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="bg-card">
              {rightPanelTab === "preview" ? (
                <PreviewPanel workspace={workspace} />
              ) : (
                <ToolsPanel workspace={workspace} />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
