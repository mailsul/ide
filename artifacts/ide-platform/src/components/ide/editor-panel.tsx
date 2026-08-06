import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useReadFileContent, useWriteFileContent } from "@workspace/api-client-react";
import { FileText, Save, Loader2 } from "lucide-react";

export function EditorPanel({ workspaceId, filePath }: { workspaceId: string; filePath: string | null }) {
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  
  const { data: fileData, isLoading } = useReadFileContent(workspaceId, filePath || "", {
    query: {
      enabled: !!workspaceId && !!filePath,
    }
  });

  const writeMutation = useWriteFileContent();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (fileData) {
      setContent(fileData.content);
      setIsSaved(true);
    } else {
      setContent("");
    }
  }, [fileData, filePath]);

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || "";
    setContent(newContent);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1 second
    saveTimeoutRef.current = setTimeout(() => {
      if (filePath) {
        writeMutation.mutate({
          workspaceId,
          data: {
            path: filePath,
            content: newContent
          }
        }, {
          onSuccess: () => setIsSaved(true)
        });
      }
    }, 1000);
  };

  if (!filePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#858585]">
        <FileText className="w-16 h-16 opacity-20 mb-4" />
        <p>Select a file to edit</p>
      </div>
    );
  }

  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'py': return 'python';
      case 'php': return 'php';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'md': return 'markdown';
      case 'sh': return 'shell';
      default: return 'plaintext';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-9 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-[#2d2d2d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-[#d4d4d4]">{filePath.split('/').pop()}</span>
          {!isSaved && <span className="w-2 h-2 rounded-full bg-[#007acc]" />}
        </div>
        <div className="flex items-center text-xs text-[#858585] gap-2">
          {writeMutation.isPending ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving</>
          ) : isSaved ? (
            "Saved"
          ) : (
            "Edited"
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#007acc]" />
          </div>
        ) : null}
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          theme="vs-dark"
          value={content}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
}
