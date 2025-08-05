import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { events } from "./events";

export const eventParticipants = pgTable(
  "event_participants",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.eventId] }),
  })
);

export const eventParticipantsRelations = relations(
  eventParticipants,
  ({ one }) => ({
    user: one(users, {
      fields: [eventParticipants.userId],
      references: [users.id],
    }),
    event: one(events, {
      fields: [eventParticipants.eventId],
      references: [events.id],
    }),
  })
);
