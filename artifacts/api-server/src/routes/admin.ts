import { Router } from "express";
import { db, usersTable, transactionsTable, portfoliosTable, investmentPlansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, formatUser } from "../lib/auth";

const router = Router();

function formatTx(t: typeof transactionsTable.$inferSelect) {
  return {
    id: t.id,
    userId: t.userId,
    type: t.type,
    amount: Number(t.amount),
    status: t.status,
    description: t.description,
    paymentMethod: t.paymentMethod,
    walletAddress: t.walletAddress,
    rejectReason: t.rejectReason,
    createdAt: t.createdAt.toISOString(),
  };
}

function formatPlan(p: typeof investmentPlansTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    minAmount: Number(p.minAmount),
    maxAmount: p.maxAmount !== null ? Number(p.maxAmount) : null,
    returnRate: Number(p.returnRate),
    durationDays: p.durationDays,
    riskLevel: p.riskLevel,
    features: p.features ?? [],
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  };
}

// Platform-wide stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable);
    const transactions = await db.select().from(transactionsTable);
    const portfolios = await db.select().from(portfoliosTable);

    const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "completed")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "completed")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalProfit = transactions.filter(t => t.type === "profit")
      .reduce((s, t) => s + Number(t.amount), 0);

    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = users.filter(u => u.createdAt > last7d).length;

    res.json({
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === "active").length,
      totalDeposits,
      totalWithdrawals,
      totalProfit,
      pendingTransactions: transactions.filter(t => t.status === "pending").length,
      totalInvestments: portfolios.length,
      recentSignups,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all users
router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map(formatUser));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single user
router.get("/users/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user (role/status/balance)
router.patch("/users/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    const { role, status, balance } = req.body;
    const updates: Record<string, unknown> = {};
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (balance !== undefined) updates.balance = String(balance);

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all transactions
router.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const txs = await db.select().from(transactionsTable);
    let filtered = txs;
    if (req.query.status) filtered = filtered.filter(t => t.status === req.query.status);
    res.json(filtered.map(formatTx));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve transaction
router.post("/transactions/:id/approve", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id)).limit(1);
    if (!tx) { res.status(404).json({ error: "Not found" }); return; }

    const [updated] = await db.update(transactionsTable)
      .set({ status: "completed" })
      .where(eq(transactionsTable.id, id))
      .returning();

    // Update user balance
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, tx.userId)).limit(1);
    if (user) {
      const delta = tx.type === "withdrawal" ? -Number(tx.amount) : Number(tx.amount);
      const newBalance = Number(user.balance) + delta;
      await db.update(usersTable).set({ balance: String(Math.max(0, newBalance)) }).where(eq(usersTable.id, user.id));
    }

    res.json(formatTx(updated));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject transaction
router.post("/transactions/:id/reject", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    const { reason } = req.body;
    const [updated] = await db.update(transactionsTable)
      .set({ status: "rejected", rejectReason: reason })
      .where(eq(transactionsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatTx(updated));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create investment plan
router.post("/investment-plans", requireAdmin, async (req, res) => {
  try {
    const { name, description, minAmount, maxAmount, returnRate, durationDays, riskLevel, features, isActive } = req.body;
    const [plan] = await db.insert(investmentPlansTable).values({
      name, description,
      minAmount: String(minAmount),
      maxAmount: maxAmount !== undefined ? String(maxAmount) : null,
      returnRate: String(returnRate),
      durationDays,
      riskLevel,
      features: features ?? [],
      isActive: isActive ?? true,
    }).returning();
    res.status(201).json(formatPlan(plan));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update investment plan
router.patch("/investment-plans/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    const { name, description, minAmount, maxAmount, returnRate, durationDays, riskLevel, features, isActive } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (minAmount !== undefined) updates.minAmount = String(minAmount);
    if (maxAmount !== undefined) updates.maxAmount = maxAmount !== null ? String(maxAmount) : null;
    if (returnRate !== undefined) updates.returnRate = String(returnRate);
    if (durationDays !== undefined) updates.durationDays = durationDays;
    if (riskLevel !== undefined) updates.riskLevel = riskLevel;
    if (features !== undefined) updates.features = features;
    if (isActive !== undefined) updates.isActive = isActive;

    const [plan] = await db.update(investmentPlansTable).set(updates).where(eq(investmentPlansTable.id, id)).returning();
    if (!plan) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatPlan(plan));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete investment plan
router.delete("/investment-plans/:id", requireAdmin, async (req, res) => {
  try {
    const rawId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const id = parseInt(rawId, 10);
    await db.delete(investmentPlansTable).where(eq(investmentPlansTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
