/**
 * Token Blacklist Management
 * 
 * In production, this should be replaced with Redis or database storage
 * for scalability across multiple server instances.
 */

// In-memory store for blacklisted tokens
// In production, use Redis: `redis.sadd('blacklisted_tokens', token)`
const blacklistedTokens = new Set<string>();

// Store user's active tokens (for logout all user's tokens)
// Format: userId -> Set<tokenId>
const userTokens = new Map<string, Set<string>>();

export class TokenBlacklistService {
  /**
   * Add a token to the blacklist
   */
  static blacklistToken(token: string): void {
    blacklistedTokens.add(token);
  }

  /**
   * Check if a token is blacklisted
   */
  static isTokenBlacklisted(token: string): boolean {
    return blacklistedTokens.has(token);
  }

  /**
   * Extract token ID from JWT token (using 'jti' claim)
   * For this implementation, we'll use the full token as ID
   */
  static getTokenId(token: string): string {
    return token;
  }

  /**
   * Add a token to user's active tokens list
   */
  static addUserToken(userId: string, token: string): void {
    if (!userTokens.has(userId)) {
      userTokens.set(userId, new Set());
    }
    userTokens.get(userId)!.add(token);
  }

  /**
   * Remove a token from user's active tokens list
   */
  static removeUserToken(userId: string, token: string): void {
    const tokens = userTokens.get(userId);
    if (tokens) {
      tokens.delete(token);
      if (tokens.size === 0) {
        userTokens.delete(userId);
      }
    }
  }

  /**
   * Blacklist all tokens for a specific user (logout from all devices)
   */
  static blacklistAllUserTokens(userId: string): void {
    const tokens = userTokens.get(userId);
    if (tokens) {
      tokens.forEach(token => {
        this.blacklistToken(token);
      });
      userTokens.delete(userId);
    }
  }

  /**
   * Blacklist specific user tokens (access and refresh)
   */
  static blacklistUserTokens(userId: string, accessToken: string, refreshToken?: string): void {
    // Blacklist the specific tokens
    this.blacklistToken(accessToken);
    if (refreshToken) {
      this.blacklistToken(refreshToken);
    }

    // Remove from user's active tokens
    this.removeUserToken(userId, accessToken);
    if (refreshToken) {
      this.removeUserToken(userId, refreshToken);
    }
  }

  /**
   * Clean expired tokens from blacklist (should be run periodically)
   */
  static cleanExpiredTokens(): void {
    // In a real implementation, you'd decode JWT tokens and check expiration
    // For now, this is a placeholder for periodic cleanup
    // This should be implemented with a cron job or scheduler
  }

  /**
   * Get stats about blacklisted tokens (for monitoring)
   */
  static getStats(): { blacklistedCount: number; activeUsersCount: number } {
    return {
      blacklistedCount: blacklistedTokens.size,
      activeUsersCount: userTokens.size,
    };
  }
}
