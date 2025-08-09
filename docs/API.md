# 📡 API Documentation

Complete reference for all LocalEve API endpoints with examples, request/response formats, and authentication requirements.

## 🔗 Base URL

```
http://localhost:3080/api
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Token Types

- **Access Token**: 15-minute expiry, used for API requests
- **Refresh Token**: 7-day expiry, used to get new access tokens

---

## 🔐 Authentication Endpoints

### POST /auth/login

**Login with email and password**

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "bio": "User bio",
      "image": "profile_image_url",
      "createdAt": "2025-08-09T12:34:12.570Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "message": "Login successful"
}
```

### POST /auth/register

**Register new user with email and password**

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "username": "johndoe",
  "bio": "Optional bio"
}
```

**Response:** Same as login

### POST /auth/oauth

**OAuth login/registration (Google, GitHub, etc.)**

**Request:**

```json
{
  "provider": "google",
  "providerAccountId": "google_user_id",
  "name": "John Doe",
  "email": "john@gmail.com",
  "image": "https://lh3.googleusercontent.com/..."
}
```

**Response:** Same as login

### POST /auth/refresh

**Refresh access token using refresh token**

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "message": "Token refreshed successfully"
}
```

### GET /auth/me 🔒

**Get current user information (requires Authorization header)**

**Headers Required:**

```
Authorization: Bearer <your_access_token>
```

**Example Request:**

```bash
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "bio": "User bio",
      "image": "profile_image_url",
      "createdAt": "2025-08-09T12:34:12.570Z"
    }
  }
}
```

**Error Response (No Authorization Header):**

```json
{
  "success": false,
  "error": "Authorization header required",
  "message": "Please provide a valid authorization token"
}
```

### POST /auth/logout 🔒

**Logout current user session (invalidates current session tokens)**

**Headers Required:**

```
Authorization: Bearer <your_access_token>
```

**Request Body (Optional):**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3080/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiJ9..."}'
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/logout-all 🔒

**Logout from all devices (invalidates all user tokens)**

**Headers Required:**

```
Authorization: Bearer <your_access_token>
```

**Example Request:**

```bash
curl -X POST http://localhost:3080/api/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## 📅 Event Endpoints

### GET /events

**Get all events with pagination**

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Tech Meetup",
      "description": "A meetup for tech enthusiasts",
      "date": "2025-08-15T18:00:00.000Z",
      "location": "San Francisco, CA",
      "organizerId": "uuid",
      "interests": ["Tech & Innovation", "Business & Career"],
      "createdAt": "2025-08-09T12:34:12.570Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /events/search

**Search events by title, description, or location**

**Query Parameters:**

- `q` (required): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /events/upcoming

**Get upcoming events only**

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /events/location/:location

**Get events by specific location**

**URL Parameters:**

- `location` (required): Location name (URL encoded)

### GET /events/interest/:interest

**Get events by specific interest category**

**URL Parameters:**

- `interest` (required): Interest category name (URL encoded)

### GET /events/interests

**Search events by multiple interests**

**Query Parameters:**

- `interests` (required): Comma-separated list of interests
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /events/:id

**Get event by ID with organizer details**

**URL Parameters:**

- `id` (required): Event UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Tech Meetup",
    "description": "A meetup for tech enthusiasts",
    "date": "2025-08-15T18:00:00.000Z",
    "location": "San Francisco, CA",
    "organizerId": "uuid",
    "interests": ["Tech & Innovation"],
    "createdAt": "2025-08-09T12:34:12.570Z",
    "organizer": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "image": "profile_image_url"
    }
  }
}
```

### GET /events/:id/participants

**Get event participants**

**URL Parameters:**

- `id` (required): Event UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /events/:id/reviews

**Get event reviews and ratings**

**URL Parameters:**

- `id` (required): Event UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

### POST /events 🔒

**Create new event (auto-assigns current user as organizer)**

**Request:**

```json
{
  "title": "Tech Meetup",
  "description": "A meetup for tech enthusiasts to discuss latest trends",
  "date": "2025-08-15T18:00:00.000Z",
  "location": "San Francisco, CA",
  "interests": ["Tech & Innovation", "Business & Career"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Tech Meetup",
    "description": "A meetup for tech enthusiasts to discuss latest trends",
    "date": "2025-08-15T18:00:00.000Z",
    "location": "San Francisco, CA",
    "organizerId": "current_user_id",
    "interests": ["Tech & Innovation", "Business & Career"],
    "createdAt": "2025-08-09T12:34:12.570Z"
  }
}
```

### PUT /events/:id 🔒

**Update event (only by organizer)**

**URL Parameters:**

- `id` (required): Event UUID

**Request:**

```json
{
  "title": "Updated Tech Meetup",
  "description": "Updated description",
  "date": "2025-08-16T19:00:00.000Z",
  "location": "Updated Location",
  "interests": ["Tech & Innovation"]
}
```

### DELETE /events/:id 🔒

**Delete event (only by organizer)**

**URL Parameters:**

- `id` (required): Event UUID

### POST /events/:id/join 🔒

**Join an event**

**URL Parameters:**

- `id` (required): Event UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "current_user_id",
    "eventId": "event_id",
    "joinedAt": "2025-08-09T12:34:12.570Z"
  },
  "message": "Successfully joined event"
}
```

### DELETE /events/:id/leave 🔒

**Leave an event**

**URL Parameters:**

- `id` (required): Event UUID

### POST /events/:id/reviews 🔒

**Add a review for an event**

**URL Parameters:**

- `id` (required): Event UUID

**Request:**

```json
{
  "rating": 5,
  "comment": "Amazing event! Learned a lot and met great people."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "event_id",
    "userId": "current_user_id",
    "rating": 5,
    "comment": "Amazing event! Learned a lot and met great people.",
    "createdAt": "2025-08-09T12:34:12.570Z"
  },
  "message": "Review added successfully"
}
```

---

## 👥 User Endpoints

### GET /users

**Get all users with pagination**

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### GET /users/search

**Search users by name, username, or bio**

**Query Parameters:**

- `q` (required): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /users/:id

**Get user by ID**

**URL Parameters:**

- `id` (required): User UUID

### GET /users/:id/profile

**Get user profile with statistics**

**URL Parameters:**

- `id` (required): User UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "bio": "User bio",
      "image": "profile_image_url",
      "createdAt": "2025-08-09T12:34:12.570Z"
    },
    "stats": {
      "eventsCreated": 5,
      "eventsJoined": 12,
      "reviewsGiven": 8,
      "followers": 25,
      "following": 18
    }
  }
}
```

### GET /users/:id/events

**Get events created by user**

**URL Parameters:**

- `id` (required): User UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /users/:id/participations

**Get events the user has joined**

**URL Parameters:**

- `id` (required): User UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

### POST /users 🔒

**Create new user (admin only)**

**Request:**

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "username": "newuser",
  "bio": "I'm a new user"
}
```

### PUT /users/:id 🔒

**Update user (self or admin only)**

**URL Parameters:**

- `id` (required): User UUID

**Request:**

```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "image": "new_profile_image_url"
}
```

### DELETE /users/:id 🔒

**Delete user (self or admin only)**

**URL Parameters:**

- `id` (required): User UUID

---

## 👫 Group Endpoints

### GET /groups

**Get all groups with pagination**

### GET /groups/search

**Search groups by name**

### GET /groups/:id

**Get group by ID**

### GET /groups/:id/members

**Get group members**

### POST /groups 🔒

**Create new group**

**Request:**

```json
{
  "name": "Tech Enthusiasts Group"
}
```

### PUT /groups/:id 🔒

**Update group (creator only)**

### DELETE /groups/:id 🔒

**Delete group (creator only)**

### POST /groups/:id/join 🔒

**Join a group**

### DELETE /groups/:id/leave 🔒

**Leave a group**

---

## 🤝 Social Endpoints

### POST /social/follow 🔒

**Follow a user**

**Request:**

```json
{
  "followerId": "current_user_id",
  "followingId": "target_user_id"
}
```

### DELETE /social/unfollow 🔒

**Unfollow a user**

**Request:**

```json
{
  "followerId": "current_user_id",
  "followingId": "target_user_id"
}
```

### GET /social/following/:userId

**Get users that the specified user follows**

### GET /social/followers/:userId

**Get users that follow the specified user**

### GET /social/following/:followerId/:followingId

**Check if one user follows another**

### POST /social/reviews 🔒

**Add a review (alternative to event-specific endpoint)**

### PUT /social/reviews/:reviewId 🔒

**Update a review**

### DELETE /social/reviews/:reviewId 🔒

**Delete a review**

### GET /social/reviews/user/:userId

**Get all reviews by a user**

---

## 🔔 Notification Endpoints

### GET /notifications/user/:userId

**Get user's notifications**

### GET /notifications/user/:userId/unread

**Get user's unread notifications**

### GET /notifications/user/:userId/count

**Get notification counts (total and unread)**

### POST /notifications 🔒

**Create a notification**

### PUT /notifications/:id/read 🔒

**Mark notification as read**

### PUT /notifications/user/:userId/read-all 🔒

**Mark all notifications as read**

### DELETE /notifications/:id 🔒

**Delete a notification**

---

## ✅ Verification Endpoints

### GET /verification

**Get all verification requests (admin)**

### GET /verification/pending

**Get pending verification requests**

### GET /verification/status/:status

**Get requests by status (pending/approved/rejected)**

### GET /verification/:id

**Get verification request by ID**

### GET /verification/user/:userId

**Get user's verification requests**

### POST /verification 🔒

**Create verification request**

**Request:**

```json
{
  "userId": "user_id",
  "documentUrl": "https://example.com/document.pdf",
  "notes": "Please verify my account"
}
```

### PUT /verification/:id 🔒

**Update verification request**

### PUT /verification/:id/approve 🔒

**Approve verification request (admin)**

### PUT /verification/:id/reject 🔒

**Reject verification request (admin)**

### DELETE /verification/:id 🔒

**Delete verification request**

---

## 🚨 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### Authentication Errors

```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Token verification failed"
}
```

### Validation Errors

```json
{
  "success": false,
  "error": {
    "name": "ZodError",
    "message": "Validation details..."
  }
}
```

---

## 📝 Notes

- 🔒 indicates protected endpoints requiring authentication
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4 (random)
- Pagination uses 1-based indexing
- Maximum items per page is 100
- All text fields support UTF-8 encoding

## 🧪 Testing

Import the Postman collection (`LocalEve_Complete_API.postman_collection.json`) for easy testing with automatic token management.
