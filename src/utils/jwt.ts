import { SignJWT, jwtVerify } from "jose";
import { TokenBlacklistService } from "./tokenBlacklist";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production"
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET ||
    "your-super-secret-refresh-key-change-this-in-production"
);

export interface JWTPayload {
  userId: string;
  email: string;
  username?: string;
  type: "access" | "refresh";
}

export class JWTService {
  // Generate access token (15 minutes)
  static async generateAccessToken(
    payload: Omit<JWTPayload, "type">
  ): Promise<string> {
    return await new SignJWT({ ...payload, type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .setIssuer("localeve-api")
      .setAudience("localeve-users")
      .sign(JWT_SECRET);
  }

  // Generate refresh token (7 days)
  static async generateRefreshToken(
    payload: Omit<JWTPayload, "type">
  ): Promise<string> {
    return await new SignJWT({ ...payload, type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setIssuer("localeve-api")
      .setAudience("localeve-users")
      .sign(REFRESH_SECRET);
  }

  // Verify access token
  static async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      // Check if token is blacklisted
      if (TokenBlacklistService.isTokenBlacklisted(token)) {
        throw new Error("Token has been invalidated");
      }

      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: "localeve-api",
        audience: "localeve-users",
      });

      if (payload.type !== "access") {
        throw new Error("Invalid token type");
      }

      return payload as unknown as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  // Verify refresh token
  static async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      // Check if token is blacklisted
      if (TokenBlacklistService.isTokenBlacklisted(token)) {
        throw new Error("Token has been invalidated");
      }

      const { payload } = await jwtVerify(token, REFRESH_SECRET, {
        issuer: "localeve-api",
        audience: "localeve-users",
      });

      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return payload as unknown as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  // Generate both tokens
  static async generateTokenPair(payload: Omit<JWTPayload, "type">) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Track tokens for this user
    TokenBlacklistService.addUserToken(payload.userId, accessToken);
    TokenBlacklistService.addUserToken(payload.userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // Invalidate specific tokens for a user
  static invalidateTokens(userId: string, accessToken: string, refreshToken?: string): void {
    TokenBlacklistService.blacklistUserTokens(userId, accessToken, refreshToken);
  }

  // Invalidate all tokens for a user (logout from all devices)
  static invalidateAllUserTokens(userId: string): void {
    TokenBlacklistService.blacklistAllUserTokens(userId);
  }
}
