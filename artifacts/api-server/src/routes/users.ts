import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser, formatUser } from "../lib/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const clerkUser = req.auth?.sessionClaims;
    const email = (clerkUser?.email as string) ?? "";
    const user = await getOrCreateUser(userId!, email);
    res.json(formatUser(user));
  } catch (err) {
    req.log.error(err, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { firstName, lastName, phone, country } = req.body;
    const [updated] = await db
      .update(usersTable)
      .set({ firstName, lastName, phone, country })
      .where(eq(usersTable.clerkId, userId!))
      .returning();
    res.json(formatUser(updated));
  } catch (err) {
    req.log.error(err, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/me/kyc", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [updated] = await db
      .update(usersTable)
      .set({ kycStatus: "pending" })
      .where(eq(usersTable.clerkId, userId!))
      .returning();
    res.json(formatUser(updated));
  } catch (err) {
    req.log.error(err, "Failed to submit KYC");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
