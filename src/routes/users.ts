import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middleware/auth";
import "../types/hono";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUserProfile,
  getUserEvents,
  getUserParticipations,
} from "../db/queries/users";

const users = new Hono();

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().max(500).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().max(500).optional(),
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

// GET /users - Get all users with pagination
users.get("/", zValidator("query", paginationSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const result = await getAllUsers(page, limit);

    return c.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

// GET /users/search - Search users
users.get("/search", zValidator("query", searchSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const q = query.q;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const results = await searchUsers(q, page, limit);

    return c.json({
      success: true,
      data: results,
      query: q,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to search users" }, 500);
  }
});

// GET /users/:id - Get user by ID
users.get("/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const user = await getUserById(userId);

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch user" }, 500);
  }
});

// GET /users/:id/profile - Get user profile with stats
users.get("/:id/profile", async (c) => {
  try {
    const userId = c.req.param("id");
    const profile = await getUserProfile(userId);

    if (!profile) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    return c.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch user profile" },
      500
    );
  }
});

// GET /users/:id/events - Get user's events
users.get("/:id/events", zValidator("query", paginationSchema), async (c) => {
  try {
    const userId = c.req.param("id");
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const events = await getUserEvents(userId, page, limit);

    return c.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch user events" },
      500
    );
  }
});

// GET /users/:id/participations - Get user's event participations
users.get(
  "/:id/participations",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const userId = c.req.param("id");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const participations = await getUserParticipations(userId, page, limit);

      return c.json({
        success: true,
        data: participations,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch user participations" },
        500
      );
    }
  }
);

// POST /users - Create new user
users.post(
  "/",
  requireAuth,
  zValidator("json", createUserSchema),
  async (c) => {
    try {
      const userData = c.req.valid("json");

      // Check if email already exists
      const existingUser = await getUserByEmail(userData.email);
      if (existingUser) {
        return c.json({ success: false, error: "Email already exists" }, 400);
      }

      // Check if username already exists (if provided)
      if (userData.username) {
        const existingUsername = await getUserByUsername(userData.username);
        if (existingUsername) {
          return c.json(
            { success: false, error: "Username already exists" },
            400
          );
        }
      }

      const user = await createUser(userData);

      return c.json(
        {
          success: true,
          data: user,
        },
        201
      );
    } catch (error) {
      return c.json({ success: false, error: "Failed to create user" }, 500);
    }
  }
);

// PUT /users/:id - Update user
users.put(
  "/:id",
  requireAuth,
  zValidator("json", updateUserSchema),
  async (c) => {
    try {
      const userId = c.req.param("id");
      const updateData = c.req.valid("json");

      // Check if user exists
      const existingUser = await getUserById(userId);
      if (!existingUser) {
        return c.json({ success: false, error: "User not found" }, 404);
      }

      // Check if email already exists (if updating email)
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await getUserByEmail(updateData.email);
        if (emailExists) {
          return c.json({ success: false, error: "Email already exists" }, 400);
        }
      }

      // Check if username already exists (if updating username)
      if (
        updateData.username &&
        updateData.username !== existingUser.username
      ) {
        const usernameExists = await getUserByUsername(updateData.username);
        if (usernameExists) {
          return c.json(
            { success: false, error: "Username already exists" },
            400
          );
        }
      }

      const updatedUser = await updateUser(userId, updateData);

      return c.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      return c.json({ success: false, error: "Failed to update user" }, 500);
    }
  }
);

// DELETE /users/:id - Delete user
users.delete("/:id", requireAuth, async (c) => {
  try {
    const userId = c.req.param("id");

    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const deletedUser = await deleteUser(userId);

    return c.json({
      success: true,
      data: deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete user" }, 500);
  }
});

export { users };
