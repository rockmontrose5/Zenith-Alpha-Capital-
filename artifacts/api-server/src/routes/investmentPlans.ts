import { Router } from "express";
import { db, investmentPlansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

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

router.get("/", async (_req, res) => {
  try {
    const plans = await db
      .select()
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.isActive, true));

    res.json(plans.map(formatPlan));
  } catch (err) {
    console.error("Investment Plans Error:", err);

    res.status(500).json({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [plan] = await db
      .select()
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.id, id))
      .limit(1);

    if (!plan) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    res.json(formatPlan(plan));
  } catch (err) {
    console.error("Investment Plan Error:", err);

    res.status(500).json({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
