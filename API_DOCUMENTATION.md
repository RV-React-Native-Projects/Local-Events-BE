# LocalEve API Documentation

## Base URL
```
http://localhost:3080
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "username": "johndoe",
  "bio": "Event enthusiast"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt-token"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/oauth
OAuth login/registration.

**Request Body:**
```json
{
  "provider": "google",
  "providerAccountId": "123456789",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://example.com/avatar.jpg"
}
```

### GET /api/auth/me
Get current user information.

### POST /api/auth/logout
Logout user.

---

## 👥 User Endpoints

### GET /api/users
Get all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

### GET /api/users/search
Search users by name, username, or bio.

**Query Parameters:**
- `q`: Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET /api/users/:id
Get user by ID.

### GET /api/users/:id/profile
Get user profile with statistics.

### GET /api/users/:id/events
Get events created by user.

### GET /api/users/:id/participations
Get events user is participating in.

### POST /api/users
Create new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "bio": "Event enthusiast",
  "image": "https://example.com/avatar.jpg"
}
```

### PUT /api/users/:id
Update user information.

### DELETE /api/users/:id
Delete user.

---

## 🎉 Event Endpoints

### GET /api/events
Get all events with pagination.

### GET /api/events/search
Search events by title, description, or location.

### GET /api/events/upcoming
Get upcoming events.

### GET /api/events/location/:location
Get events by location.

### GET /api/events/:id
Get event by ID with participants and reviews.

### GET /api/events/:id/participants
Get event participants.

### GET /api/events/:id/reviews
Get event reviews.

### POST /api/events
Create new event.

**Request Body:**
```json
{
  "title": "Tech Meetup 2024",
  "description": "Join us for an exciting tech meetup",
  "date": "2024-12-25T18:00:00Z",
  "location": "San Francisco, CA",
  "organizerId": "user-uuid"
}
```

### PUT /api/events/:id
Update event.

### DELETE /api/events/:id
Delete event.

### POST /api/events/:id/join
Join an event.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

### DELETE /api/events/:id/leave
Leave an event.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

### POST /api/events/:id/reviews
Add review to event.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "rating": 5,
  "comment": "Great event!"
}
```

---

## 👥 Group Endpoints

### GET /api/groups
Get all groups with pagination.

### GET /api/groups/search
Search groups by name.

### GET /api/groups/:id
Get group by ID with members.

### GET /api/groups/:id/members
Get group members.

### POST /api/groups
Create new group.

**Request Body:**
```json
{
  "name": "Tech Enthusiasts",
  "createdBy": "user-uuid"
}
```

### PUT /api/groups/:id
Update group.

### DELETE /api/groups/:id
Delete group.

### POST /api/groups/:id/join
Join a group.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

### DELETE /api/groups/:id/leave
Leave a group.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

---

## 🤝 Social Endpoints

### POST /api/social/follow
Follow a user.

**Request Body:**
```json
{
  "followerId": "user-uuid",
  "followingId": "user-uuid"
}
```

### DELETE /api/social/unfollow
Unfollow a user.

### GET /api/social/following/:userId
Get user's following list.

### GET /api/social/followers/:userId
Get user's followers list.

### GET /api/social/following/:followerId/:followingId
Check if user is following another user.

### POST /api/social/reviews
Add event review.

**Request Body:**
```json
{
  "eventId": "event-uuid",
  "userId": "user-uuid",
  "rating": 5,
  "comment": "Amazing event!"
}
```

### PUT /api/social/reviews/:reviewId
Update review.

### DELETE /api/social/reviews/:reviewId
Delete review.

### GET /api/social/reviews/user/:userId
Get user's reviews.

---

## 🔔 Notification Endpoints

### GET /api/notifications/user/:userId
Get user's notifications.

### GET /api/notifications/user/:userId/unread
Get unread notifications.

### GET /api/notifications/user/:userId/count
Get notification count.

### POST /api/notifications
Create notification.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "content": "You have a new event invitation",
  "read": false
}
```

### PUT /api/notifications/:id/read
Mark notification as read.

### PUT /api/notifications/user/:userId/read-all
Mark all notifications as read.

### DELETE /api/notifications/:id
Delete notification.

---

## ✅ Verification Endpoints

### GET /api/verification
Get all verification requests (admin).

### GET /api/verification/pending
Get pending verification requests.

### GET /api/verification/status/:status
Get requests by status (pending/approved/rejected).

### GET /api/verification/:id
Get verification request by ID.

### GET /api/verification/user/:userId
Get user's verification requests.

### POST /api/verification
Create verification request.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "documentUrl": "https://example.com/document.pdf",
  "notes": "Verification request"
}
```

### PUT /api/verification/:id
Update verification request.

### PUT /api/verification/:id/approve
Approve verification request.

**Request Body:**
```json
{
  "reviewerId": "admin-uuid",
  "notes": "Approved"
}
```

### PUT /api/verification/:id/reject
Reject verification request.

### DELETE /api/verification/:id
Delete verification request.

---

## 📊 Pagination

Most list endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🚨 Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## 🔧 Development

### Running the API
```bash
bun run dev
```

### Database Setup
```bash
bun run db:push
bun run db:seed
```

### Testing Endpoints
You can test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Example curl commands

**Get all users:**
```bash
curl http://localhost:3080/api/users
```

**Create a user:**
```bash
curl -X POST http://localhost:3080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe"
  }'
```

**Create an event:**
```bash
curl -X POST http://localhost:3080/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Meetup",
    "description": "Join us for an exciting tech meetup",
    "date": "2024-12-25T18:00:00Z",
    "location": "San Francisco, CA",
    "organizerId": "user-uuid"
  }'
```

---

## 📝 Notes

1. **Authentication**: Implement proper JWT authentication for production
2. **Validation**: All inputs are validated using Zod schemas
3. **Error Handling**: Comprehensive error handling with meaningful messages
4. **CORS**: Configured for local development
5. **Database**: PostgreSQL with Drizzle ORM
6. **TypeScript**: Fully typed API with proper interfaces

---

**LocalEve API v1.0.0** 🎉 