import { pgTable, serial, timestamp, numeric, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const referralStatusEnum = pgEnum("referral_status", ["pending", "paid"]);

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => usersTable.id),
  referredId: integer("referred_id").notNull().references(() => usersTable.id),
  referredEmail: text("referred_email").notNull(),
  bonus: numeric("bonus", { precision: 18, scale: 2 }).notNull().default("0"),
  status: referralStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
