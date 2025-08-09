import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middleware/auth";
import "../types/hono";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
  getUpcomingEvents,
  getEventsByLocation,
  getEventsByInterest,
  searchEventsByInterests,
  joinEvent,
  leaveEvent,
  isUserParticipating,
  getEventParticipants,
  addEventReview,
  getEventReviews,
  getEventsByOrganizer,
} from "../db/queries/events";

const events = new Hono();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().min(1).max(255),
  interests: z.array(z.string()).optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  location: z.string().min(1).max(255).optional(),
  interests: z.array(z.string()).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

// GET /events - Get all events with pagination
events.get("/", zValidator("query", paginationSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const result = await getAllEvents(page, limit);

    return c.json({
      success: true,
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch events" }, 500);
  }
});

// GET /events/search - Search events
events.get("/search", zValidator("query", searchSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const q = query.q;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const results = await searchEvents(q, page, limit);

    return c.json({
      success: true,
      data: results,
      query: q,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to search events" }, 500);
  }
});

// GET /events/upcoming - Get upcoming events
events.get("/upcoming", zValidator("query", paginationSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const results = await getUpcomingEvents(page, limit);

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch upcoming events" },
      500
    );
  }
});

// GET /events/location/:location - Get events by location
events.get(
  "/location/:location",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const location = c.req.param("location");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const results = await getEventsByLocation(location, page, limit);

      return c.json({
        success: true,
        data: results,
        location,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch events by location" },
        500
      );
    }
  }
);

// GET /events/interest/:interest - Get events by interest category
events.get(
  "/interest/:interest",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const interest = c.req.param("interest");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const results = await getEventsByInterest(interest, page, limit);

      return c.json({
        success: true,
        data: results,
        interest,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch events by interest" },
        500
      );
    }
  }
);

// GET /events/interests - Search events by multiple interests
events.get(
  "/interests",
  zValidator(
    "query",
    z.object({
      interests: z.string(),
      page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
      limit: z
        .string()
        .transform(Number)
        .pipe(z.number().min(1).max(100))
        .optional(),
    })
  ),
  async (c) => {
    try {
      const query = c.req.valid("query");
      const interests = query.interests.split(",").map((i) => i.trim());
      const page = query.page || 1;
      const limit = query.limit || 10;
      const results = await searchEventsByInterests(interests, page, limit);

      return c.json({
        success: true,
        data: results,
        interests,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch events by interests" },
        500
      );
    }
  }
);

// GET /events/:id - Get event by ID
events.get("/:id", optionalAuth, async (c) => {
  try {
    const eventId = c.req.param("id");
    const event = await getEventById(eventId);

    if (!event) {
      return c.json({ success: false, error: "Event not found" }, 404);
    }

    return c.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch event" }, 500);
  }
});

// GET /events/:id/participants - Get event participants
events.get(
  "/:id/participants",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const eventId = c.req.param("id");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const participants = await getEventParticipants(eventId, page, limit);

      return c.json({
        success: true,
        data: participants,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch event participants" },
        500
      );
    }
  }
);

// GET /events/:id/reviews - Get event reviews
events.get("/:id/reviews", zValidator("query", paginationSchema), async (c) => {
  try {
    const eventId = c.req.param("id");
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const reviews = await getEventReviews(eventId, page, limit);

    return c.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch event reviews" },
      500
    );
  }
});

// POST /events - Create new event
events.post(
  "/",
  requireAuth,
  zValidator("json", createEventSchema),
  async (c) => {
    try {
      const eventData = c.req.valid("json");
      const user = c.get("user");

      const event = await createEvent({
        ...eventData,
        date: new Date(eventData.date),
        organizerId: user.userId,
      });

      return c.json(
        {
          success: true,
          data: event,
        },
        201
      );
    } catch (error) {
      return c.json({ success: false, error: "Failed to create event" }, 500);
    }
  }
);

// PUT /events/:id - Update event
events.put(
  "/:id",
  requireAuth,
  zValidator("json", updateEventSchema),
  async (c) => {
    try {
      const eventId = c.req.param("id");
      const updateData = c.req.valid("json");

      // Check if event exists
      const existingEvent = await getEventById(eventId);
      if (!existingEvent) {
        return c.json({ success: false, error: "Event not found" }, 404);
      }

      const updatePayload: {
        title?: string;
        description?: string;
        date?: Date;
        location?: string;
        interests?: string[];
      } = {};

      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.description)
        updatePayload.description = updateData.description;
      if (updateData.date) updatePayload.date = new Date(updateData.date);
      if (updateData.location) updatePayload.location = updateData.location;
      if (updateData.interests) updatePayload.interests = updateData.interests;

      const updatedEvent = await updateEvent(eventId, updatePayload);

      return c.json({
        success: true,
        data: updatedEvent,
      });
    } catch (error) {
      return c.json({ success: false, error: "Failed to update event" }, 500);
    }
  }
);

// DELETE /events/:id - Delete event
events.delete("/:id", requireAuth, async (c) => {
  try {
    const eventId = c.req.param("id");

    // Check if event exists
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) {
      return c.json({ success: false, error: "Event not found" }, 404);
    }

    const deletedEvent = await deleteEvent(eventId);

    return c.json({
      success: true,
      data: deletedEvent,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete event" }, 500);
  }
});

// POST /events/:id/join - Join event
events.post("/:id/join", requireAuth, async (c) => {
  try {
    const eventId = c.req.param("id");
    const user = c.get("user");

    // Check if already participating
    const isParticipating = await isUserParticipating(user.userId, eventId);
    if (isParticipating) {
      return c.json(
        { success: false, error: "Already participating in this event" },
        400
      );
    }

    const participation = await joinEvent(user.userId, eventId);

    return c.json({
      success: true,
      data: participation,
      message: "Successfully joined event",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to join event" }, 500);
  }
});

// DELETE /events/:id/leave - Leave event
events.delete("/:id/leave", requireAuth, async (c) => {
  try {
    const eventId = c.req.param("id");
    const user = c.get("user");

    const participation = await leaveEvent(user.userId, eventId);

    return c.json({
      success: true,
      data: participation,
      message: "Successfully left event",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to leave event" }, 500);
  }
});

// POST /events/:id/reviews - Add event review
events.post(
  "/:id/reviews",
  requireAuth,
  zValidator("json", reviewSchema),
  async (c) => {
    try {
      const eventId = c.req.param("id");
      const reviewData = c.req.valid("json");
      const user = c.get("user");

      const review = await addEventReview({
        eventId,
        userId: user.userId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      return c.json(
        {
          success: true,
          data: review,
          message: "Review added successfully",
        },
        201
      );
    } catch (error) {
      return c.json({ success: false, error: "Failed to add review" }, 500);
    }
  }
);

export { events };
