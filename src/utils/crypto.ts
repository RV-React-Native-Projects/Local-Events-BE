// Modern password hashing using Web Crypto API (Bun compatible)

export class PasswordService {
  // Hash password using scrypt (secure and modern)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Use scrypt for password hashing
    const key = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000, // 100k iterations for security
        hash: "SHA-256",
      },
      key,
      256 // 32 bytes
    );

    // Combine salt and hash
    const hashArray = new Uint8Array(derivedBits);
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt);
    combined.set(hashArray, salt.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  }

  // Verify password against hash
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);

      // Decode the stored hash
      const combined = new Uint8Array(
        atob(hash)
          .split("")
          .map((char) => char.charCodeAt(0))
      );

      // Extract salt (first 16 bytes) and hash (remaining bytes)
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);

      // Derive key with same parameters
      const key = await crypto.subtle.importKey(
        "raw",
        data,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        key,
        256
      );

      const newHash = new Uint8Array(derivedBits);

      // Compare hashes
      if (storedHash.length !== newHash.length) {
        return false;
      }

      for (let i = 0; i < storedHash.length; i++) {
        if (storedHash[i] !== newHash[i]) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }
}
