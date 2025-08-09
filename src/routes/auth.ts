import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PasswordService } from "../utils/crypto";
import {
  getUserAccount,
  createUserAccount,
  getUserWithAccount,
  getUserByProviderAccountId,
} from "../db/queries/auth";
import { createUser, getUserByEmail } from "../db/queries/users";
import { JWTService } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";
import "../types/hono";

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

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
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

    // Check if user has a password (for password-based auth)
    if (!user.password) {
      return c.json(
        {
          success: false,
          error: "This account uses OAuth login. Please use Google login.",
        },
        400
      );
    }

    // Verify password using Web Crypto API
    const isPasswordValid = await PasswordService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return c.json({ success: false, error: "Invalid credentials" }, 401);
    }

    // Generate JWT tokens
    const tokens = await JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username || undefined,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        ...tokens,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
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

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(
      userData.password
    );

    // Create user with hashed password
    const user = await createUser({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      username: userData.username,
      bio: userData.bio,
    });

    // Generate JWT tokens
    const tokens = await JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username || undefined,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          ...tokens,
        },
        message: "Registration successful",
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
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
      // Generate JWT tokens for existing OAuth user
      const tokens = await JWTService.generateTokenPair({
        userId: existingUserWithAccount.user.id,
        email: existingUserWithAccount.user.email,
        username: existingUserWithAccount.user.username || undefined,
      });

      return c.json({
        success: true,
        data: {
          user: existingUserWithAccount.user,
          ...tokens,
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

      // Generate JWT tokens for linked account
      const tokens = await JWTService.generateTokenPair({
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username || undefined,
      });

      return c.json({
        success: true,
        data: {
          user: existingUser,
          ...tokens,
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

    // Generate JWT tokens for new OAuth user
    const tokens = await JWTService.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username || undefined,
    });

    return c.json(
      {
        success: true,
        data: {
          user,
          ...tokens,
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

// POST /auth/refresh - Refresh access token
auth.post("/refresh", zValidator("json", refreshTokenSchema), async (c) => {
  try {
    const { refreshToken } = c.req.valid("json");

    // Verify refresh token
    const payload = await JWTService.verifyRefreshToken(refreshToken);

    // Generate new access token
    const newTokens = await JWTService.generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    });

    return c.json({
      success: true,
      data: newTokens,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Invalid or expired refresh token" },
      401
    );
  }
});

// GET /auth/me - Get current user
auth.get("/me", requireAuth, async (c) => {
  try {
    const user = c.get("user");

    // Get full user details from database
    const fullUser = await getUserByEmail(user.email);
    if (!fullUser) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = fullUser;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return c.json({ success: false, error: "Failed to get current user" }, 500);
  }
});

// POST /auth/logout - User logout (current session)
auth.post("/logout", requireAuth, async (c) => {
  try {
    const user = c.get("user");
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader) {
      return c.json({ success: false, error: "Authorization header required" }, 401);
    }

    const accessToken = authHeader.replace("Bearer ", "");
    
    // Get refresh token from request body (optional)
    const body = await c.req.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    // Invalidate the specific tokens for this user
    JWTService.invalidateTokens(user.userId, accessToken, refreshToken);

    return c.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ success: false, error: "Logout failed" }, 500);
  }
});

// POST /auth/logout-all - Logout from all devices
auth.post("/logout-all", requireAuth, async (c) => {
  try {
    const user = c.get("user");

    // Invalidate all tokens for this user
    JWTService.invalidateAllUserTokens(user.userId);

    return c.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    return c.json({ success: false, error: "Logout from all devices failed" }, 500);
  }
});

export { auth };
