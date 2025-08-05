import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { events } from "./events";
import { users } from "./users";

export const eventReviews = pgTable("event_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id),
  userId: uuid("user_id").references(() => users.id),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventReviewsRelations = relations(eventReviews, ({ one }) => ({
  user: one(users, { fields: [eventReviews.userId], references: [users.id] }),
  event: one(events, {
    fields: [eventReviews.eventId],
    references: [events.id],
  }),
}));
