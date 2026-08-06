import { Router, type IRouter } from "express";
import { db, workspaceFilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";
import { param } from "../lib/params.js";

const router: IRouter = Router();

function getLanguageFromExt(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", tsx: "typescriptreact", jsx: "javascriptreact",
    py: "python", php: "php", go: "go", rs: "rust", java: "java", rb: "ruby",
    cs: "csharp", html: "html", css: "css", json: "json", yaml: "yaml", yml: "yaml",
    md: "markdown", sh: "shell", bash: "shell", sql: "sql", toml: "toml",
  };
  return map[ext] || "plaintext";
}

function buildTree(files: Array<{ path: string; type: string }>): unknown[] {
  const roots: unknown[] = [];
  const nodeMap: Record<string, { name: string; path: string; type: string; size: number | null; children: unknown[] | null }> = {};

  const sorted = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const file of sorted) {
    const parts = file.path.split("/");
    const name = parts[parts.length - 1];
    const node = {
      name,
      path: file.path,
      type: file.type,
      size: file.type === "file" ? file.path.length * 10 : null,
      children: file.type === "directory" ? [] : null,
    };
    nodeMap[file.path] = node;

    if (parts.length === 1) {
      roots.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = nodeMap[parentPath];
      if (parent?.children) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

router.get("/workspaces/:workspaceId/files", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const files = await db.select({
    path: workspaceFilesTable.path,
    type: workspaceFilesTable.type,
  }).from(workspaceFilesTable)
    .where(eq(workspaceFilesTable.workspaceId, workspaceId));

  res.json(buildTree(files));
});

router.post("/workspaces/:workspaceId/files", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { path, type, content } = req.body;

  if (!path || !type) {
    res.status(400).json({ error: "path and type are required" });
    return;
  }

  const [file] = await db.insert(workspaceFilesTable).values({
    id: generateId("file"),
    workspaceId,
    path,
    type,
    content: content || "",
  }).returning();

  const name = path.split("/").pop() || path;
  res.status(201).json({
    name,
    path: file.path,
    type: file.type,
    size: type === "file" ? (content?.length || 0) : null,
    children: type === "directory" ? [] : null,
  });
});

router.post("/workspaces/:workspaceId/files/read", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { path } = req.body;

  if (!path) {
    res.status(400).json({ error: "path is required" });
    return;
  }

  const [file] = await db.select()
    .from(workspaceFilesTable)
    .where(and(
      eq(workspaceFilesTable.workspaceId, workspaceId),
      eq(workspaceFilesTable.path, path as string)
    ));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json({
    path: file.path,
    content: file.content,
    language: getLanguageFromExt(file.path),
  });
});

router.post("/workspaces/:workspaceId/files/write", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { path, content } = req.body;

  if (!path || content == null) {
    res.status(400).json({ error: "path and content are required" });
    return;
  }

  const existing = await db.select().from(workspaceFilesTable)
    .where(and(
      eq(workspaceFilesTable.workspaceId, workspaceId),
      eq(workspaceFilesTable.path, path as string)
    ));

  if (existing.length > 0) {
    await db.update(workspaceFilesTable)
      .set({ content, updatedAt: new Date() })
      .where(and(
        eq(workspaceFilesTable.workspaceId, workspaceId),
        eq(workspaceFilesTable.path, path as string)
      ));
  } else {
    await db.insert(workspaceFilesTable).values({
      id: generateId("file"),
      workspaceId,
      path,
      type: "file",
      content,
    });
  }

  res.json({ success: true, message: "File saved" });
});

router.post("/workspaces/:workspaceId/files/rename", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { oldPath, newPath } = req.body;

  if (!oldPath || !newPath) {
    res.status(400).json({ error: "oldPath and newPath are required" });
    return;
  }

  await db.update(workspaceFilesTable)
    .set({ path: newPath as string })
    .where(and(
      eq(workspaceFilesTable.workspaceId, workspaceId),
      eq(workspaceFilesTable.path, oldPath as string)
    ));

  res.json({ success: true, message: "File renamed" });
});

router.post("/workspaces/:workspaceId/files/delete", requireAuth, async (req, res): Promise<void> => {
  const workspaceId = param(req.params.workspaceId);
  const { path } = req.body;

  if (!path) {
    res.status(400).json({ error: "path is required" });
    return;
  }

  await db.delete(workspaceFilesTable)
    .where(and(
      eq(workspaceFilesTable.workspaceId, workspaceId),
      eq(workspaceFilesTable.path, path as string)
    ));

  res.json({ success: true, message: "File deleted" });
});

export default router;
