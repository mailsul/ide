import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspaceDomainsTable = pgTable("workspace_domains", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  domain: text("domain").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending|active|error
  sslStatus: text("ssl_status"), // pending|valid|error
  dnsRecordType: text("dns_record_type").notNull().default("CNAME"),
  dnsRecordName: text("dns_record_name").notNull().default("@"),
  dnsRecordValue: text("dns_record_value").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWorkspaceDomainSchema = createInsertSchema(workspaceDomainsTable).omit({ createdAt: true });
export type InsertWorkspaceDomain = z.infer<typeof insertWorkspaceDomainSchema>;
export type WorkspaceDomain = typeof workspaceDomainsTable.$inferSelect;
