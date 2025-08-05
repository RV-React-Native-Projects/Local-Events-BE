import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getUserAccount,
  createUserAccount,
  getUserWithAccount,
  getUserByProviderAccountId,
} from "../db/queries/auth";
import { createUser, getUserByEmail } from "../db/queries/users";

const auth = new Hono();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6),
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
});

const oauthSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  image: z.string().url().max(500).optional(),
});

// POST /auth/login - User login
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return c.json({ success: false, error: "Invalid credentials" }, 401);
    }

    // In a real app, you would verify the password here
    // For now, we'll just return the user
    return c.json({
      success: true,
      data: {
        user,
        token: "mock-jwt-token", // In real app, generate JWT
      },
    });
  } catch (error) {
    return c.json({ success: false, error: "Login failed" }, 500);
  }
});

// POST /auth/register - User registration
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const userData = c.req.valid("json");

    // Check if email already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return c.json({ success: false, error: "Email already exists" }, 400);
    }

    // Create user (without password for now - you'd hash it in real app)
    const user = await createUser({
      name: userData.name,
      email: userData.email,
      username: userData.username,
      bio: userData.bio,
    });

    return c.json(
      {
        success: true,
        data: {
          user,
          token: "mock-jwt-token", // In real app, generate JWT
        },
      },
      201
    );
  } catch (error) {
    return c.json({ success: false, error: "Registration failed" }, 500);
  }
});

// POST /auth/oauth - OAuth login/registration
auth.post("/oauth", zValidator("json", oauthSchema), async (c) => {
  try {
    const oauthData = c.req.valid("json");

    // Check if user exists with this provider account
    const existingUserWithAccount = await getUserByProviderAccountId(
      oauthData.provider,
      oauthData.providerAccountId
    );

    if (existingUserWithAccount) {
      return c.json({
        success: true,
        data: {
          user: existingUserWithAccount.user,
          token: "mock-jwt-token",
        },
      });
    }

    // Check if user exists with this email
    const existingUser = await getUserByEmail(oauthData.email);

    if (existingUser) {
      // Link existing account to OAuth provider
      await createUserAccount({
        userId: existingUser.id,
        provider: oauthData.provider,
        providerAccountId: oauthData.providerAccountId,
      });

      return c.json({
        success: true,
        data: {
          user: existingUser,
          token: "mock-jwt-token",
        },
      });
    }

    // Create new user and account
    const user = await createUser({
      name: oauthData.name,
      email: oauthData.email,
      image: oauthData.image,
    });

    await createUserAccount({
      userId: user.id,
      provider: oauthData.provider,
      providerAccountId: oauthData.providerAccountId,
    });

    return c.json(
      {
        success: true,
        data: {
          user,
          token: "mock-jwt-token",
        },
      },
      201
    );
  } catch (error) {
    return c.json(
      { success: false, error: "OAuth authentication failed" },
      500
    );
  }
});

// GET /auth/me - Get current user
auth.get("/me", async (c) => {
  try {
    // In a real app, you'd get the user from JWT token
    // For now, we'll return a mock response
    return c.json({
      success: true,
      data: {
        message: "Get user from JWT token",
      },
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to get current user" }, 500);
  }
});

// POST /auth/logout - User logout
auth.post("/logout", async (c) => {
  try {
    // In a real app, you'd invalidate the JWT token
    return c.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Logout failed" }, 500);
  }
});

export { auth };
