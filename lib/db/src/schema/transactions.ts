import { pgTable, serial, timestamp, numeric, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "profit", "bonus", "referral"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "approved", "rejected", "completed"]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  paymentMethod: text("payment_method"),
  walletAddress: text("wallet_address"),
  rejectReason: text("reject_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
