import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspaceSecretsTable = pgTable("workspace_secrets", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  key: text("key").notNull(),
  valueEncrypted: text("value_encrypted").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceSecretSchema = createInsertSchema(workspaceSecretsTable).omit({ createdAt: true });
export type InsertWorkspaceSecret = z.infer<typeof insertWorkspaceSecretSchema>;
export type WorkspaceSecret = typeof workspaceSecretsTable.$inferSelect;
