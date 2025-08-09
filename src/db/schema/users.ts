import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { events } from "./events";
import { eventParticipants } from "./event_participants";
import { eventReviews } from "./event_reviews";
import { follows } from "./follows";
import { notifications } from "./notifications";
import { verificationRequests } from "./verification_requests";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 524 }),
  image: varchar("image", { length: 500 }),
  username: varchar("username", { length: 50 }).unique(),
  bio: varchar("bio", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, { fields: [users.id], references: [accounts.userId] }),
  events: many(events),
  eventParticipants: many(eventParticipants),
  reviews: many(eventReviews),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "followers" }),
  notifications: many(notifications),
  verificationRequests: many(verificationRequests),
}));
