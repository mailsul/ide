import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspaceDatabasesTable = pgTable("workspace_databases", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  dbType: text("db_type").notNull(), // mysql|postgres
  dbName: text("db_name").notNull(),
  dbUser: text("db_user").notNull(),
  dbHost: text("db_host").notNull().default("localhost"),
  dbPort: integer("db_port").notNull().default(5432),
  dbPasswordEncrypted: text("db_password_encrypted").notNull(),
  connectionUrl: text("connection_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceDatabaseSchema = createInsertSchema(workspaceDatabasesTable).omit({ createdAt: true });
export type InsertWorkspaceDatabase = z.infer<typeof insertWorkspaceDatabaseSchema>;
export type WorkspaceDatabase = typeof workspaceDatabasesTable.$inferSelect;
