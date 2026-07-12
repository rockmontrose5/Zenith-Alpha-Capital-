import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser, formatUser } from "../lib/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionClaims = auth.sessionClaims as Record<string, any> | undefined;

    const email =
      sessionClaims?.email ??
      sessionClaims?.email_address ??
      sessionClaims?.["https://clerk.dev/email"] ??
      "";

    const user = await getOrCreateUser(auth.userId, email);

    res.json(formatUser(user));
  } catch (err) {
    req.log.error(err, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, phone, country } = req.body;

    const [updated] = await db
      .update(usersTable)
      .set({
        firstName,
        lastName,
        phone,
        country,
      })
      .where(eq(usersTable.clerkId, auth.userId))
      .returning();

    res.json(formatUser(updated));
  } catch (err) {
    req.log.error(err, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/me/kyc", requireAuth, async (req, res) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [updated] = await db
      .update(usersTable)
      .set({
        kycStatus: "pending",
      })
      .where(eq(usersTable.clerkId, auth.userId))
      .returning();

    res.json(formatUser(updated));
  } catch (err) {
    req.log.error(err, "Failed to submit KYC");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
