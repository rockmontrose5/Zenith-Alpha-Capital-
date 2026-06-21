import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, referralsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatReferral(r: typeof referralsTable.$inferSelect) {
  return {
    id: r.id,
    referrerId: r.referrerId,
    referredId: r.referredId,
    referredEmail: r.referredEmail,
    bonus: Number(r.bonus),
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.json([]); return; }
    const refs = await db.select().from(referralsTable).where(eq(referralsTable.referrerId, user.id));
    res.json(refs.map(formatReferral));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const refs = await db.select().from(referralsTable).where(eq(referralsTable.referrerId, user.id));
    const totalBonus = refs.reduce((sum, r) => sum + Number(r.bonus), 0);
    const pendingBonus = refs.filter(r => r.status === "pending").reduce((sum, r) => sum + Number(r.bonus), 0);

    const host = req.headers.host ?? "zenithalphacapital.com";
    const proto = req.headers["x-forwarded-proto"] ?? "https";

    res.json({
      totalReferrals: refs.length,
      totalBonus,
      pendingBonus,
      referralCode: user.referralCode,
      referralLink: `${proto}://${host}?ref=${user.referralCode}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
