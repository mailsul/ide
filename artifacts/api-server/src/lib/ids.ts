import { randomBytes } from "crypto";

export function generateId(prefix?: string): string {
  const id = randomBytes(12).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) + "-" + randomBytes(4).toString("hex");
}

export function encrypt(text: string): string {
  // Simple base64 encoding for demo — in production use AES-256
  return Buffer.from(text).toString("base64");
}

export function decrypt(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}
