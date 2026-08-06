import { useState } from "react";
import { FileNode } from "@workspace/api-client-react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Plus, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SiNodedotjs, SiPython, SiPhp, SiGo, SiRust, SiJavascript, SiCss, SiHtml5, SiTypescript, SiReact, SiJson, SiMarkdown } from "react-icons/si";

export function FileTree({ 
  workspaceId, 
  files, 
  activeFile, 
  onSelectFile 
}: { 
  workspaceId: string;
  files: FileNode[];
  activeFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-sidebar/50">
      <div className="h-9 px-3 flex items-center justify-between border-b border-border/50 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">Files</span>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-sidebar-accent rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {files.map((node) => (
            <FileTreeNode 
              key={node.path} 
              node={node} 
              activeFile={activeFile} 
              onSelectFile={onSelectFile}
              depth={0} 
            />
          ))}
          {files.length === 0 && (
            <div className="text-xs text-muted-foreground p-4 text-center">No files in workspace</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FileTreeNode({ 
  node, 
  activeFile, 
  onSelectFile,
  depth
}: { 
  node: FileNode;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === "directory";
  const isActive = activeFile === node.path;

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return <SiJavascript className="w-3.5 h-3.5 text-yellow-400" />;
      case 'jsx': return <SiReact className="w-3.5 h-3.5 text-blue-400" />;
      case 'ts': return <SiTypescript className="w-3.5 h-3.5 text-blue-500" />;
      case 'tsx': return <SiReact className="w-3.5 h-3.5 text-blue-500" />;
      case 'json': return <SiJson className="w-3.5 h-3.5 text-yellow-500" />;
      case 'html': return <SiHtml5 className="w-3.5 h-3.5 text-orange-500" />;
      case 'css': return <SiCss className="w-3.5 h-3.5 text-blue-400" />;
      case 'py': return <SiPython className="w-3.5 h-3.5 text-blue-500" />;
      case 'php': return <SiPhp className="w-3.5 h-3.5 text-purple-400" />;
      case 'go': return <SiGo className="w-3.5 h-3.5 text-cyan-500" />;
      case 'rs': return <SiRust className="w-3.5 h-3.5 text-orange-500" />;
      case 'md': return <SiMarkdown className="w-3.5 h-3.5 text-gray-300" />;
      default: return <FileText className="w-3.5 h-3.5 text-sidebar-foreground/60" />;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDir) setIsOpen(!isOpen);
    else onSelectFile(node.path);
  };

  return (
    <div>
      <div 
        className={`flex items-center gap-1.5 py-1 px-1.5 rounded-md cursor-pointer text-sm transition-colors group
          ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'}
        `}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        onClick={handleToggle}
      >
        <div className="w-4 flex items-center justify-center shrink-0">
          {isDir && (
            <div className="text-sidebar-foreground/50 group-hover:text-sidebar-foreground">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          )}
        </div>
        
        <div className="shrink-0 flex items-center justify-center">
          {isDir ? (
            isOpen ? <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/60" /> : <Folder className="w-3.5 h-3.5 text-sidebar-foreground/60" />
          ) : (
            getFileIcon(node.name)
          )}
        </div>
        
        <span className="truncate flex-1 select-none">{node.name}</span>
      </div>

      {isDir && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode 
              key={child.path} 
              node={child} 
              activeFile={activeFile} 
              onSelectFile={onSelectFile}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
