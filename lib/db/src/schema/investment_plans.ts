import { pgTable, text, serial, timestamp, numeric, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);

export const investmentPlansTable = pgTable("investment_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minAmount: numeric("min_amount", { precision: 18, scale: 2 }).notNull(),
  maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
  returnRate: numeric("return_rate", { precision: 5, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull().default("medium"),
  features: text("features").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvestmentPlanSchema = createInsertSchema(investmentPlansTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInvestmentPlan = z.infer<typeof insertInvestmentPlanSchema>;
export type InvestmentPlan = typeof investmentPlansTable.$inferSelect;
