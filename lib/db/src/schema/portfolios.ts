import { pgTable, serial, timestamp, numeric, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { investmentPlansTable } from "./investment_plans";

export const portfolioStatusEnum = pgEnum("portfolio_status", ["active", "completed", "cancelled"]);

export const portfoliosTable = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  planId: integer("plan_id").notNull().references(() => investmentPlansTable.id),
  planName: text("plan_name").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 18, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 18, scale: 2 }).notNull().default("0"),
  returnRate: numeric("return_rate", { precision: 5, scale: 2 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: portfolioStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioSchema = createInsertSchema(portfoliosTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfoliosTable.$inferSelect;
