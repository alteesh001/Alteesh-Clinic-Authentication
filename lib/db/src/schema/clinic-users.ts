import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const clinicUsersTable = pgTable("clinic_users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email"),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("doctor"),
  clinicName: text("clinic_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertClinicUserSchema = createInsertSchema(clinicUsersTable).extend({
  role: z.enum(["super_admin", "admin", "doctor", "nurse", "receptionist"]),
});

export type InsertClinicUser = z.infer<typeof insertClinicUserSchema>;
export type ClinicUser = typeof clinicUsersTable.$inferSelect;