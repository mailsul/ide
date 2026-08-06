import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspacePortsTable = pgTable("workspace_ports", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  internalPort: integer("internal_port").notNull(),
  name: text("name").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  externalUrl: text("external_url"),
  pid: integer("pid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspacePortSchema = createInsertSchema(workspacePortsTable).omit({ createdAt: true });
export type InsertWorkspacePort = z.infer<typeof insertWorkspacePortSchema>;
export type WorkspacePort = typeof workspacePortsTable.$inferSelect;
