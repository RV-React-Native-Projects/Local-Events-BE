import { Context, Next } from "hono";
import { JWTService } from "../utils/jwt";

export interface AuthContext {
  user: {
    userId: string;
    email: string;
    username?: string;
  };
}

// Middleware to verify JWT tokens
export const requireAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json(
        {
          success: false,
          error: "Authorization header required",
          message: "Please provide a valid authorization token",
        },
        401
      );
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return c.json(
        {
          success: false,
          error: "Token required",
          message: "Please provide a valid authorization token",
        },
        401
      );
    }

    // Verify the token
    const payload = await JWTService.verifyAccessToken(token);

    // Add user info to context
    c.set("user", {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    });

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Invalid token",
        message:
          error instanceof Error ? error.message : "Token verification failed",
      },
      401
    );
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        const payload = await JWTService.verifyAccessToken(token);
        c.set("user", {
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
        });
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  await next();
};
