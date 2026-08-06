import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityItemsTable = pgTable("activity_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  workspaceName: text("workspace_name").notNull(),
  type: text("type").notNull(), // workspace_created|workspace_started|etc
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivityItemSchema = createInsertSchema(activityItemsTable).omit({ createdAt: true });
export type InsertActivityItem = z.infer<typeof insertActivityItemSchema>;
export type ActivityItem = typeof activityItemsTable.$inferSelect;
