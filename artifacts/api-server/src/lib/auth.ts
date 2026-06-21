import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1);
  if (!user[0] || user[0].role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export async function getOrCreateUser(clerkId: string, email: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing[0]) return existing[0];

  const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  const [user] = await db.insert(usersTable).values({
    clerkId,
    email,
    referralCode,
    role: "user",
    status: "active",
  }).returning();
  return user;
}

export function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    country: u.country,
    role: u.role,
    status: u.status,
    balance: Number(u.balance),
    totalInvested: Number(u.totalInvested),
    totalProfit: Number(u.totalProfit),
    referralCode: u.referralCode,
    referredBy: u.referredBy,
    kycStatus: u.kycStatus,
    createdAt: u.createdAt.toISOString(),
  };
}
