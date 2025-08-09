# 🗄️ Database Documentation

Complete database schema, relationships, and query patterns for the LocalEve backend.

## 🏗️ Architecture Overview

The database uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations. The schema is designed for scalability and performance with proper indexing and relationships.

### Technology Stack
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Query Builder**: Drizzle Query API

---

## 📊 Database Schema

### 🔗 Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Accounts  │    │   Events    │
│             │────│             │    │             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ name        │    │ userId (FK) │    │ title       │
│ email       │    │ provider    │    │ description │
│ password    │    │ providerAccId│   │ date        │
│ username    │    └─────────────┘    │ location    │
│ bio         │                       │ organizerId │
│ image       │    ┌─────────────┐    │ interests[] │
│ createdAt   │    │   Follows   │    │ createdAt   │
└─────────────┘    │             │    └─────────────┘
       │           │ followerId  │           │
       │           │ followingId │           │
       │           │ followedAt  │           │
       │           └─────────────┘           │
       │                                     │
       │           ┌─────────────┐           │
       └───────────│Event_Parts  │───────────┘
                   │             │
                   │ userId (FK) │
                   │ eventId(FK) │
                   │ joinedAt    │
                   └─────────────┘
```

---

## 📋 Table Definitions

### 👤 Users Table

**Primary table for user accounts and profiles**

```sql
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(524), -- PBKDF2 hash (nullable for OAuth users)
  "image" VARCHAR(500),
  "username" VARCHAR(50) UNIQUE,
  "bio" VARCHAR(500),
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `UNIQUE INDEX` on `email`
- `UNIQUE INDEX` on `username`
- `INDEX` on `created_at` for sorting

**Relationships:**
- One-to-many with `accounts` (OAuth providers)
- One-to-many with `events` (as organizer)
- Many-to-many with `events` (as participant)
- One-to-many with `event_reviews`
- Many-to-many with `users` (followers/following)
- One-to-many with `notifications`
- One-to-many with `verification_requests`

### 🔗 Accounts Table

**OAuth provider accounts linked to users**

```sql
CREATE TABLE "accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "provider" VARCHAR(100) NOT NULL, -- 'google', 'github', etc.
  "provider_account_id" VARCHAR(100) NOT NULL
);
```

**Indexes:**
- `INDEX` on `user_id`
- `UNIQUE INDEX` on `(provider, provider_account_id)`

### 📅 Events Table

**Core events with interest categorization**

```sql
CREATE TABLE "events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(100),
  "description" TEXT,
  "date" TIMESTAMP NOT NULL,
  "location" VARCHAR(255),
  "organizer_id" UUID REFERENCES "users"("id"),
  "interests" TEXT[], -- Array of interest categories
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `INDEX` on `organizer_id`
- `INDEX` on `date` for upcoming events
- `INDEX` on `location` for location-based searches
- `GIN INDEX` on `interests` for array searches
- `INDEX` on `created_at` for sorting

**Interest Categories:**
```typescript
[
  "Music & Audio",
  "Coffee & Chat", 
  "Arts & Crafts",
  "Photography",
  "Books & Poetry",
  "Games & Sports",
  "Food & Cooking",
  "Tech & Innovation",
  "Fitness & Wellness",
  "Social Impact",
  "Music Production",
  "Business & Career",
  "Learning & Education",
  "Outdoor Adventures",
  "Nightlife & Entertainment",
  "Community Building"
]
```

### 🎫 Event Participants Table

**Many-to-many relationship between users and events**

```sql
CREATE TABLE "event_participants" (
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "event_id" UUID NOT NULL REFERENCES "events"("id"),
  "joined_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("user_id", "event_id")
);
```

**Indexes:**
- `PRIMARY KEY` on `(user_id, event_id)`
- `INDEX` on `event_id` for participant lists
- `INDEX` on `joined_at` for chronological order

### ⭐ Event Reviews Table

**Reviews and ratings for events**

```sql
CREATE TABLE "event_reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "events"("id"),
  "user_id" UUID REFERENCES "users"("id"),
  "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `INDEX` on `event_id` for event reviews
- `INDEX` on `user_id` for user reviews
- `UNIQUE INDEX` on `(event_id, user_id)` (one review per user per event)

### 👫 Groups Table

**User groups for community building**

```sql
CREATE TABLE "groups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100),
  "created_by" UUID REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `INDEX` on `created_by`
- `INDEX` on `name` for search
- `INDEX` on `created_at` for sorting

### 👥 Group Members Table

**Many-to-many relationship between users and groups**

```sql
CREATE TABLE "group_members" (
  "group_id" UUID NOT NULL REFERENCES "groups"("id"),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "joined_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("group_id", "user_id")
);
```

**Indexes:**
- `PRIMARY KEY` on `(group_id, user_id)`
- `INDEX` on `user_id` for user groups

### 👥 Follows Table

**Social following relationships**

```sql
CREATE TABLE "follows" (
  "follower_id" UUID NOT NULL REFERENCES "users"("id"),
  "following_id" UUID NOT NULL REFERENCES "users"("id"),
  "followed_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("follower_id", "following_id"),
  CHECK ("follower_id" != "following_id") -- Prevent self-follows
);
```

**Indexes:**
- `PRIMARY KEY` on `(follower_id, following_id)`
- `INDEX` on `following_id` for followers list
- `INDEX` on `followed_at` for recent follows

### 🔔 Notifications Table

**User notifications system**

```sql
CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "content" TEXT,
  "read" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `INDEX` on `user_id`
- `INDEX` on `(user_id, read)` for unread notifications
- `INDEX` on `created_at` for chronological order

### ✅ Verification Requests Table

**User verification system**

```sql
CREATE TABLE "verification_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "document_url" VARCHAR(500),
  "status" VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  "reviewed_by" UUID REFERENCES "users"("id"),
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `INDEX` on `user_id`
- `INDEX` on `status` for filtering
- `INDEX` on `reviewed_by` for admin queries

---

## 🔍 Query Patterns

### Common Queries

#### **Get User with Profile Stats**
```typescript
const userWithStats = await db
  .select({
    user: users,
    eventsCreated: count(events.id),
    // ... other stats
  })
  .from(users)
  .leftJoin(events, eq(events.organizerId, users.id))
  .where(eq(users.id, userId))
  .groupBy(users.id);
```

#### **Get Events with Participants**
```typescript
const eventsWithParticipants = await db
  .select({
    event: events,
    participantCount: count(eventParticipants.userId),
  })
  .from(events)
  .leftJoin(eventParticipants, eq(eventParticipants.eventId, events.id))
  .groupBy(events.id);
```

#### **Search Events by Interests**
```typescript
const eventsByInterests = await db
  .select()
  .from(events)
  .where(
    or(
      arrayContains(events.interests, interest1),
      arrayContains(events.interests, interest2)
    )
  );
```

#### **Get User's Social Feed**
```typescript
const socialFeed = await db
  .select({
    event: events,
    organizer: users,
  })
  .from(events)
  .innerJoin(users, eq(events.organizerId, users.id))
  .innerJoin(follows, eq(follows.followingId, users.id))
  .where(eq(follows.followerId, currentUserId))
  .orderBy(desc(events.createdAt));
```

### Performance Optimizations

#### **Pagination Pattern**
```typescript
const paginatedResults = await db
  .select()
  .from(events)
  .orderBy(desc(events.createdAt))
  .limit(limit)
  .offset((page - 1) * limit);
```

#### **Full-Text Search**
```typescript
// Using PostgreSQL full-text search
const searchResults = await db
  .select()
  .from(events)
  .where(
    or(
      ilike(events.title, `%${query}%`),
      ilike(events.description, `%${query}%`),
      ilike(events.location, `%${query}%`)
    )
  );
```

---

## 🚀 Migration Management

### Using Drizzle Kit

#### **Generate Migration**
```bash
# After changing schema files
bun run db:generate
```

#### **Apply Migrations**
```bash
# For production environments
bun run db:migrate

# For development (direct schema sync)
bun run db:push
```

#### **Reset Database**
```bash
# Drop all tables and recreate
bun run db:reset
```

### Migration Files

Migrations are stored in the `drizzle/` directory:
```
drizzle/
├── 0000_initial_schema.sql
├── 0001_add_interests_to_events.sql
├── 0002_add_password_to_users.sql
└── meta/
    ├── _journal.json
    └── 0000_snapshot.json
```

---

## 📊 Database Seeding

### Seed Data Types

The seed script creates:
- **2 test users** with password authentication
- **18 OAuth users** with random data
- **15 events** with varied interests and locations
- **12 groups** with random names
- **Participant relationships** (users joining events)
- **Group memberships**
- **Event reviews** with ratings 1-5
- **Follow relationships** between users
- **Notifications** for various activities
- **Verification requests** in different states

### Running Seeds

```bash
# Full database reset and seed
bun run db:seed

# Alternative seed script
bun run db:seed2
```

### Test Data

**Test Users:**
- `john@example.com` / `password123`
- `jane@example.com` / `password123`

**Sample Data:**
- Events across 16 interest categories
- Geographic diversity in locations
- Realistic user profiles and interactions

---

## 🔒 Security Considerations

### Password Storage
- **PBKDF2** hashing with 100,000 iterations
- **Random salt** per password
- **524-character** field to store base64-encoded hash

### Data Validation
- **Email uniqueness** enforced at DB level
- **Username uniqueness** enforced at DB level
- **Rating bounds** (1-5) enforced with CHECK constraints
- **Self-follow prevention** with CHECK constraints

### Indexes for Performance
- All foreign keys are indexed
- Search fields (`email`, `username`, `location`) are indexed
- Array fields (`interests`) use GIN indexes
- Timestamp fields are indexed for sorting

---

## 🔧 Database Configuration

### Connection Setup
```typescript
// drizzle.config.ts
export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
});
```

### Environment Variables
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/localeve"
```

---

## 📈 Monitoring & Maintenance

### Query Performance
- Monitor slow queries with `EXPLAIN ANALYZE`
- Use appropriate indexes for query patterns
- Consider partitioning for large tables

### Data Integrity
- Foreign key constraints maintain referential integrity
- CHECK constraints enforce business rules
- UNIQUE constraints prevent duplicates

### Backup Strategy
- Regular PostgreSQL dumps
- Point-in-time recovery capability
- Test restore procedures

---

## 🛠️ Development Tools

### Database Studio
```bash
# Open Drizzle Studio in browser
bun run db:studio
```

### Query Debugging
```typescript
// Enable query logging
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(client, { 
  schema,
  logger: true // Logs all SQL queries
});
```

### Schema Validation
```bash
# Validate schema against database
bun run db:check
```

This database design supports the full feature set of LocalEve while maintaining performance, scalability, and data integrity.
