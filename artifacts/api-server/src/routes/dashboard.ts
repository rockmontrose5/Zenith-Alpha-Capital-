import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, portfoliosTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
    if (!user) {
      res.json({
        totalBalance: 0,
        totalInvested: 0,
        totalProfit: 0,
        activeInvestments: 0,
        pendingTransactions: 0,
        referralBonus: 0,
        recentTransactions: [],
      });
      return;
    }

    const portfolios = await db.select().from(portfoliosTable)
      .where(and(eq(portfoliosTable.userId, user.id), eq(portfoliosTable.status, "active")));

    const transactions = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id));
    const pendingTxs = transactions.filter(t => t.status === "pending");
    const recentTxs = transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    const referralBonus = transactions.filter(t => t.type === "referral").reduce((s, t) => s + Number(t.amount), 0);

    res.json({
      totalBalance: Number(user.balance),
      totalInvested: Number(user.totalInvested),
      totalProfit: Number(user.totalProfit),
      activeInvestments: portfolios.length,
      pendingTransactions: pendingTxs.length,
      referralBonus,
      recentTransactions: recentTxs.map(t => ({
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
      })),
    });
  } catch (err) {
    req.log.error(err, "Dashboard summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
