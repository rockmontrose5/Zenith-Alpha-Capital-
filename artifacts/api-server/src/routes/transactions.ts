import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, transactionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

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

router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.json([]); return; }

    let query = db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id));
    const txs = await query;
    let filtered = txs;
    if (req.query.type) filtered = filtered.filter(t => t.type === req.query.type);
    if (req.query.status) filtered = filtered.filter(t => t.status === req.query.status);
    res.json(filtered.map(formatTx));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const { type, amount, paymentMethod, walletAddress, description } = req.body;
    const [tx] = await db.insert(transactionsTable).values({
      userId: user.id,
      type,
      amount: String(amount),
      status: "pending",
      paymentMethod,
      walletAddress,
      description,
    }).returning();

    res.status(201).json(formatTx(tx));
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
    const [tx] = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id))).limit(1);
    if (!tx) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatTx(tx));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
