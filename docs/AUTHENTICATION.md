# 🔐 Authentication System Documentation

Complete guide to JWT-based authentication implementation in LocalEve backend.

## 🏗️ Architecture Overview

The authentication system uses **JSON Web Tokens (JWT)** with the following components:

- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) for obtaining new access tokens
- **Password Authentication**: PBKDF2 hashing for secure password storage
- **OAuth Integration**: Support for Google, GitHub, and other providers

---

## 🔑 Token Structure

### Access Token

```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "username": "johndoe",
  "type": "access",
  "iat": 1754742868,
  "exp": 1754743768,
  "iss": "localeve-api",
  "aud": "localeve-users"
}
```

### Refresh Token

```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "username": "johndoe",
  "type": "refresh",
  "iat": 1754742868,
  "exp": 1755347668,
  "iss": "localeve-api",
  "aud": "localeve-users"
}
```

### Token Response Format

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

## 🛡️ Security Implementation

### Token Blacklisting System

**Purpose**: Secure logout by invalidating tokens  
**Storage**: In-memory set (production should use Redis)  
**Features**:

- Single session logout (invalidate specific tokens)
- All devices logout (invalidate all user tokens)
- Token verification checks blacklist before JWT validation

### Password Hashing (Web Crypto API)

**Technology**: PBKDF2 with SHA-256  
**Iterations**: 100,000  
**Salt**: 16 random bytes per password  
**Storage**: Base64-encoded salt + hash

```typescript
// Password hashing
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey(
  "raw",
  passwordData,
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

// Combine salt + hash and encode
const combined = new Uint8Array(salt.length + hashArray.length);
combined.set(salt);
combined.set(hashArray, salt.length);
const hashedPassword = btoa(
  String.fromCharCode.apply(null, Array.from(combined))
);
```

### JWT Token Security

**Algorithm**: HS256 (HMAC with SHA-256)  
**Secrets**: Separate secrets for access and refresh tokens  
**Validation**: Issuer, audience, expiration, and type checking

```typescript
// Token generation
const accessToken = await new SignJWT({ ...payload, type: "access" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("15m")
  .setIssuer("localeve-api")
  .setAudience("localeve-users")
  .sign(JWT_SECRET);
```

---

## 🔄 Authentication Flow

### 1. Password-Based Registration

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant Crypto

    Client->>API: POST /auth/register
    API->>API: Validate input (Zod)
    API->>DB: Check email uniqueness
    API->>Crypto: Hash password (PBKDF2)
    API->>DB: Create user record
    API->>API: Generate JWT tokens
    API->>Client: Return user + tokens
```

**Request:**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "username": "johndoe",
  "bio": "Software developer"
}
```

### 2. Password-Based Login

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant Crypto
    participant JWT

    Client->>API: POST /auth/login
    API->>API: Validate input (Zod)
    API->>DB: Find user by email
    API->>Crypto: Verify password hash
    API->>JWT: Generate access + refresh tokens
    API->>Client: Return user + tokens
```

**Request:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. OAuth Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant OAuth
    participant JWT

    Client->>OAuth: Authenticate with provider
    OAuth->>Client: Return provider data
    Client->>API: POST /auth/oauth
    API->>DB: Check existing user/account
    API->>DB: Create/link user account
    API->>JWT: Generate tokens
    API->>Client: Return user + tokens
```

**Request:**

```bash
POST /api/auth/oauth
Content-Type: application/json

{
  "provider": "google",
  "providerAccountId": "google_user_id_123",
  "name": "John Doe",
  "email": "john@gmail.com",
  "image": "https://lh3.googleusercontent.com/..."
}
```

### 4. Token Refresh

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant JWT
    participant Blacklist

    Client->>API: POST /auth/refresh
    API->>Blacklist: Check if token blacklisted
    API->>JWT: Verify refresh token
    API->>JWT: Generate new token pair
    API->>Client: Return new tokens
```

### 5. Logout Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant JWT
    participant Blacklist

    Client->>API: POST /auth/logout
    API->>JWT: Extract token from header
    API->>Blacklist: Add tokens to blacklist
    API->>Client: Success response

    Note over Client: Client clears local tokens

    Client->>API: POST /auth/logout-all
    API->>Blacklist: Blacklist all user tokens
    API->>Client: Success response
```

**Request:**

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

## 🛠️ Middleware Implementation

### Authentication Middleware

**Required Authentication** (`requireAuth`):

```typescript
export const requireAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        { success: false, error: "Authorization header required" },
        401
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await JWTService.verifyAccessToken(token);

    c.set("user", {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    });

    await next();
  } catch (error) {
    return c.json({ success: false, error: "Invalid token" }, 401);
  }
};
```

**Optional Authentication** (`optionalAuth`):

```typescript
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const payload = await JWTService.verifyAccessToken(token);
      c.set("user", {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
      });
    }
  } catch (error) {
    // Silently ignore auth errors
  }
  await next();
};
```

### Usage in Routes

**Protected Route:**

```typescript
events.post(
  "/",
  requireAuth,
  zValidator("json", createEventSchema),
  async (c) => {
    const user = c.get("user"); // TypeScript typed user context
    const eventData = c.req.valid("json");

    const event = await createEvent({
      ...eventData,
      organizerId: user.userId, // Auto-assign from JWT
    });

    return c.json({ success: true, data: event });
  }
);
```

**Public Route with Optional Auth:**

```typescript
events.get("/:id", optionalAuth, async (c) => {
  const user = c.get("user"); // May be undefined
  const eventId = c.req.param("id");

  const event = await getEventById(eventId);
  // Add user-specific data if authenticated

  return c.json({ success: true, data: event });
});
```

---

## 🔒 Route Protection

### Protection Levels

| Level         | Middleware     | Description                    | Examples                                 |
| ------------- | -------------- | ------------------------------ | ---------------------------------------- |
| **Public**    | None           | No authentication required     | `GET /events`, `GET /users`              |
| **Optional**  | `optionalAuth` | Enhanced data if authenticated | `GET /events/:id` (may show join status) |
| **Protected** | `requireAuth`  | Authentication required        | `POST /events`, `PUT /users/:id`         |

### Route Categories

#### **Public Routes**

- `GET /events` - Browse events
- `GET /events/search` - Search events
- `GET /events/:id` - View event details
- `GET /users` - Browse users
- `GET /groups` - Browse groups
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/oauth` - OAuth login

#### **Protected Routes**

- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/join` - Join event
- `GET /auth/me` - Get current user (requires Authorization header)
- `POST /auth/logout` - Logout current session (requires Authorization header)
- `POST /auth/logout-all` - Logout all devices (requires Authorization header)
- All user management operations
- All social features
- All notifications
- All verification requests

---

## 🧪 Testing Authentication

### Test Credentials

**Password Users:**

```bash
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

### Manual Testing Flow

#### 1. **Login and Get Tokens**

```bash
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

#### 2. **Use Access Token**

```bash
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

#### 3. **Create Protected Resource**

```bash
curl -X POST http://localhost:3080/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","description":"Test","date":"2025-08-15T18:00:00.000Z","location":"Test Location"}'
```

#### 4. **Refresh Tokens**

```bash
curl -X POST http://localhost:3080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiJ9..."}'
```

#### 5. **Logout Current Session**

```bash
curl -X POST http://localhost:3080/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiJ9..."}'
```

#### 6. **Logout All Devices**

```bash
curl -X POST http://localhost:3080/api/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/localeve"

# Server
PORT=3080
NODE_ENV=development
```

### Security Recommendations

#### **Production JWT Secrets**

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use openssl
openssl rand -hex 64
```

#### **Token Expiration Strategy**

- **Access Token**: 15 minutes (balance security vs UX)
- **Refresh Token**: 7 days (allow reasonable offline periods)
- **Consider**: Sliding expiration for active users

#### **HTTPS Requirements**

```bash
# Always use HTTPS in production
FORCE_HTTPS=true
SECURE_COOKIES=true
```

---

## 🚨 Error Handling

### Authentication Errors

**Missing Token:**

```json
{
  "success": false,
  "error": "Authorization header required",
  "message": "Please provide a valid authorization token"
}
```

**Invalid Token:**

```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Token verification failed"
}
```

**Expired Token:**

```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Invalid or expired access token"
}
```

**Invalid Credentials:**

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Error Status Codes

- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Valid auth but insufficient permissions
- **400 Bad Request**: Invalid request format/validation

---

## 🔄 Token Refresh Strategy

### Client-Side Implementation

**Automatic Refresh:**

```typescript
// Intercept 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });
          const { accessToken } = response.data.data;
          localStorage.setItem("auth_token", accessToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Server-Side Considerations

**Refresh Token Rotation:**

```typescript
// Generate new refresh token on each refresh
const newTokens = await JWTService.generateTokenPair(payload);
// Invalidate old refresh token (implement blacklist if needed)
```

**Token Blacklisting:**

```typescript
// Optional: Implement token blacklist for logout
const blacklistedTokens = new Set(); // Use Redis in production

export const blacklistToken = (token: string) => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token: string) => {
  return blacklistedTokens.has(token);
};
```

---

## 📊 Monitoring & Analytics

### Authentication Metrics

**Track These Events:**

- Successful logins by provider type
- Failed login attempts
- Token refresh frequency
- Password reset requests
- OAuth provider distribution

### Security Monitoring

**Watch For:**

- Unusual login patterns
- Multiple failed attempts
- Token replay attacks
- Geographic anomalies

### Performance Metrics

**Monitor:**

- JWT verification time
- Password hashing duration
- Database query performance for auth operations

---

## 🛡️ Security Best Practices

### Token Storage

**Client-Side:**

- Store access tokens in memory (React state)
- Store refresh tokens in httpOnly cookies (preferred) or secure localStorage
- Never store tokens in regular localStorage in production

### Password Policies

**Requirements:**

- Minimum 6 characters (configurable)
- Consider requiring complexity in production
- Implement rate limiting for login attempts

### OAuth Security

**Validation:**

- Verify OAuth tokens with provider APIs
- Validate email domain restrictions if needed
- Handle OAuth error cases gracefully

### API Security

**Headers:**

- Implement CORS properly
- Use security headers (helmet.js)
- Rate limiting on auth endpoints

This authentication system provides enterprise-grade security while maintaining developer-friendly APIs and user experience.
