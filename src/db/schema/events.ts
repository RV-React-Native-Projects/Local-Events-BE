import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { eventParticipants } from "./event_participants";
import { eventReviews } from "./event_reviews";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }),
  organizerId: uuid("organizer_id").references(() => users.id),
  interests: text("interests").array(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
  reviews: many(eventReviews),
}));
