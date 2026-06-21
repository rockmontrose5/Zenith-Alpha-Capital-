import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, portfoliosTable, usersTable, investmentPlansTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function formatPortfolio(p: typeof portfoliosTable.$inferSelect) {
  return {
    id: p.id,
    userId: p.userId,
    planId: p.planId,
    planName: p.planName,
    amount: Number(p.amount),
    currentValue: Number(p.currentValue),
    profit: Number(p.profit),
    returnRate: Number(p.returnRate),
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const portfolios = await db.select().from(portfoliosTable).where(eq(portfoliosTable.userId, user.id));
    res.json(portfolios.map(formatPortfolio));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { planId, amount } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const [plan] = await db.select().from(investmentPlansTable).where(eq(investmentPlansTable.id, planId)).limit(1);
    if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const [portfolio] = await db.insert(portfoliosTable).values({
      userId: user.id,
      planId,
      planName: plan.name,
      amount: String(amount),
      currentValue: String(amount),
      profit: "0",
      returnRate: plan.returnRate,
      startDate,
      endDate,
      status: "active",
    }).returning();

    // Record deposit transaction
    await db.insert(transactionsTable).values({
      userId: user.id,
      type: "deposit",
      amount: String(amount),
      status: "pending",
      description: `Investment in ${plan.name}`,
    });

    // Update user totals
    const newTotal = Number(user.totalInvested) + Number(amount);
    await db.update(usersTable).set({ totalInvested: String(newTotal) }).where(eq(usersTable.id, user.id));

    res.status(201).json(formatPortfolio(portfolio));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const id = parseInt(req.params.id);
    const [portfolio] = await db.select().from(portfoliosTable)
      .where(and(eq(portfoliosTable.id, id), eq(portfoliosTable.userId, user.id))).limit(1);
    if (!portfolio) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPortfolio(portfolio));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
