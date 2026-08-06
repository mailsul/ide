import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformSettingsTable = pgTable("platform_settings", {
  id: text("id").primaryKey().default("singleton"),
  platformName: text("platform_name").notNull().default("DevSpace"),
  domain: text("domain").notNull().default("localhost"),
  registrationEnabled: boolean("registration_enabled").notNull().default(false),
  defaultPlan: text("default_plan").notNull().default("free"),
  maxWorkspacesPerUser: integer("max_workspaces_per_user").notNull().default(5),
  maxRamMb: integer("max_ram_mb").notNull().default(512),
  maxDiskMb: integer("max_disk_mb").notNull().default(1024),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettingsTable);
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettingsTable.$inferSelect;
