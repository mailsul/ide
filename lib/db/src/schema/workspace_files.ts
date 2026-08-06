import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Stores virtual file system per workspace
export const workspaceFilesTable = pgTable("workspace_files", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  path: text("path").notNull(), // e.g. "src/index.js"
  type: text("type").notNull().default("file"), // file|directory
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceFileSchema = createInsertSchema(workspaceFilesTable).omit({ createdAt: true, updatedAt: true });
export type InsertWorkspaceFile = z.infer<typeof insertWorkspaceFileSchema>;
export type WorkspaceFile = typeof workspaceFilesTable.$inferSelect;
