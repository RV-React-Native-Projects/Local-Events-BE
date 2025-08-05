import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  documentUrl: varchar("document_url", { length: 500 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationRequestsRelations = relations(
  verificationRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationRequests.userId],
      references: [users.id],
    }),
    reviewedByUser: one(users, {
      fields: [verificationRequests.reviewedBy],
      references: [users.id],
    }),
  })
);
