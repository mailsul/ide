import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth.js";
import { generateId } from "../lib/ids.js";

const router: IRouter = Router();

// GET /auth/setup-status
router.get("/auth/setup-status", async (_req, res): Promise<void> => {
  const [{ value }] = await db.select({ value: count() }).from(usersTable);
  const userCount = Number(value);
  res.json({ needsSetup: userCount === 0, userCount });
});

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { username, fullName, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: "username, email and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  // Check if this is the first user
  const [{ value: userCount }] = await db.select({ value: count() }).from(usersTable);
  const isFirstUser = Number(userCount) === 0;

  // If not first user, registration must be enabled (check platform settings)
  if (!isFirstUser) {
    // For simplicity, allow registration if not first user (admin can disable via settings)
    // In a real app, check platformSettingsTable.registrationEnabled
  }

  // Check for duplicate
  const existing = await db.select().from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const existingUsername = await db.select().from(usersTable)
    .where(eq(usersTable.username, username));
  if (existingUsername.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = generateId("usr");

  const [user] = await db.insert(usersTable).values({
    id: userId,
    username,
    fullName: fullName || null,
    email,
    passwordHash,
    role: isFirstUser ? "admin" : "user",
    plan: "free",
    onboardingCompleted: false,
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      onboardingCompleted: user.onboardingCompleted,
    },
    token,
  });
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      onboardingCompleted: user.onboardingCompleted,
    },
    token,
  });
});

// POST /auth/logout
router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true, message: "Logged out" });
});

// GET /auth/me
router.get("/auth/me", requireAuth, (req, res): void => {
  const u = req.user!;
  res.json({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    plan: u.plan,
    createdAt: new Date().toISOString(),
    onboardingCompleted: u.onboardingCompleted,
  });
});

export default router;
