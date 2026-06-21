import { pgTable, text, serial, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending"]);
export const kycStatusEnum = pgEnum("kyc_status", ["none", "pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  country: text("country"),
  role: userRoleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("active"),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  totalInvested: numeric("total_invested", { precision: 18, scale: 2 }).notNull().default("0"),
  totalProfit: numeric("total_profit", { precision: 18, scale: 2 }).notNull().default("0"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("none"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
