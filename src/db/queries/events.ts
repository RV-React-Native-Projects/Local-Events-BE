import { eq, desc, asc, like, and, or, gte, lte, count } from "drizzle-orm";
import { db } from "../db";
import { events, users, eventParticipants, eventReviews } from "../schema";

// Get all events with pagination
export const getAllEvents = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;

  const allEvents = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  const totalCount = await db.select({ count: events.id }).from(events);

  return {
    events: allEvents,
    pagination: {
      page,
      limit,
      total: totalCount.length,
      totalPages: Math.ceil(totalCount.length / limit),
    },
  };
};

// Get event by ID with organizer and participants
export const getEventById = async (eventId: string) => {
  const [event] = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(eq(events.id, eventId));

  if (!event) return null;

  // Get participants
  const participants = await db
    .select({
      user: users,
      joinedAt: eventParticipants.joinedAt,
    })
    .from(eventParticipants)
    .innerJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, eventId))
    .orderBy(desc(eventParticipants.joinedAt));

  // Get reviews
  const reviews = await db
    .select({
      review: eventReviews,
      user: users,
    })
    .from(eventReviews)
    .innerJoin(users, eq(eventReviews.userId, users.id))
    .where(eq(eventReviews.eventId, eventId))
    .orderBy(desc(eventReviews.createdAt));

  return {
    ...event,
    participants,
    reviews,
  };
};

// Create new event
export const createEvent = async (eventData: {
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  interests?: string[];
}): Promise<{
  id: string;
  title: string | null;
  description: string | null;
  date: Date;
  location: string | null;
  organizerId: string | null;
  interests: string[] | null;
  createdAt: Date | null;
}> => {
  const [event] = await db.insert(events).values(eventData).returning();

  return event;
};

// Update event
export const updateEvent = async (
  eventId: string,
  updateData: Partial<{
    title: string;
    description: string;
    date: Date;
    location: string;
    interests: string[];
  }>
): Promise<
  | {
      id: string;
      title: string | null;
      description: string | null;
      date: Date;
      location: string | null;
      organizerId: string | null;
      interests: string[] | null;
      createdAt: Date | null;
    }
  | undefined
> => {
  const [updatedEvent] = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, eventId))
    .returning();

  return updatedEvent;
};

// Delete event
export const deleteEvent = async (eventId: string) => {
  const [deletedEvent] = await db
    .delete(events)
    .where(eq(events.id, eventId))
    .returning();

  return deletedEvent;
};

// Search events
export const searchEvents = async (
  query: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const searchResults = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(
      or(
        like(events.title, `%${query}%`),
        like(events.description, `%${query}%`),
        like(events.location, `%${query}%`)
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return searchResults;
};

// Get upcoming events
export const getUpcomingEvents = async (
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const upcomingEvents = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(gte(events.date, new Date()))
    .limit(limit)
    .offset(offset)
    .orderBy(asc(events.date));

  return upcomingEvents;
};

// Get events by location
export const getEventsByLocation = async (
  location: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const locationEvents = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(like(events.location, `%${location}%`))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return locationEvents;
};

// Get events by interest category
export const getEventsByInterest = async (
  interest: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const interestEvents = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(like(events.interests, `%${interest}%`))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return interestEvents;
};

// Search events by interests
export const searchEventsByInterests = async (
  interests: string[],
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const interestConditions = interests.map((interest) =>
    like(events.interests, `%${interest}%`)
  );

  const interestEvents = await db
    .select({
      event: events,
      organizer: users,
    })
    .from(events)
    .innerJoin(users, eq(events.organizerId, users.id))
    .where(or(...interestConditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return interestEvents;
};

// Join event
export const joinEvent = async (userId: string, eventId: string) => {
  const [participation] = await db
    .insert(eventParticipants)
    .values({
      userId,
      eventId,
    })
    .returning();

  return participation;
};

// Leave event
export const leaveEvent = async (userId: string, eventId: string) => {
  const [participation] = await db
    .delete(eventParticipants)
    .where(
      and(
        eq(eventParticipants.userId, userId),
        eq(eventParticipants.eventId, eventId)
      )
    )
    .returning();

  return participation;
};

// Check if user is participating in event
export const isUserParticipating = async (userId: string, eventId: string) => {
  const [participation] = await db
    .select()
    .from(eventParticipants)
    .where(
      and(
        eq(eventParticipants.userId, userId),
        eq(eventParticipants.eventId, eventId)
      )
    );

  return !!participation;
};

// Get event participants
export const getEventParticipants = async (
  eventId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const participants = await db
    .select({
      user: users,
      joinedAt: eventParticipants.joinedAt,
    })
    .from(eventParticipants)
    .innerJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, eventId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(eventParticipants.joinedAt));

  return participants;
};

// Add event review
export const addEventReview = async (reviewData: {
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
}) => {
  const [review] = await db.insert(eventReviews).values(reviewData).returning();

  return review;
};

// Get event reviews
export const getEventReviews = async (
  eventId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const reviews = await db
    .select({
      review: eventReviews,
      user: users,
    })
    .from(eventReviews)
    .innerJoin(users, eq(eventReviews.userId, users.id))
    .where(eq(eventReviews.eventId, eventId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(eventReviews.createdAt));

  return reviews;
};

// Get events organized by user
export const getEventsByOrganizer = async (
  organizerId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const organizerEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizerId, organizerId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return organizerEvents;
};
