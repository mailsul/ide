import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspacesTable = pgTable("workspaces", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  language: text("language").notNull().default("nodejs"),
  status: text("status").notNull().default("stopped"), // running|stopped|sleeping|error|starting
  isPublished: boolean("is_published").notNull().default(false),
  publishedUrl: text("published_url"),
  devUrl: text("dev_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastActive: timestamp("last_active", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspacesTable).omit({ createdAt: true, lastActive: true });
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspacesTable.$inferSelect;
