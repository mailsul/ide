import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspaceWorkflowsTable = pgTable("workspace_workflows", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  command: text("command").notNull(),
  port: integer("port"),
  autoStart: boolean("auto_start").notNull().default(false),
  status: text("status").notNull().default("stopped"), // running|stopped|error
  pid: integer("pid"),
  logs: text("logs").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceWorkflowSchema = createInsertSchema(workspaceWorkflowsTable).omit({ createdAt: true });
export type InsertWorkspaceWorkflow = z.infer<typeof insertWorkspaceWorkflowSchema>;
export type WorkspaceWorkflow = typeof workspaceWorkflowsTable.$inferSelect;
