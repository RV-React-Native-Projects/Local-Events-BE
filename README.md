# LocalEve Backend

A modern event management platform backend built with TypeScript, Drizzle ORM, and PostgreSQL.

## 🚀 Features

- **User Management**: Complete user authentication and profile system
- **Event Management**: Create, organize, and participate in events
- **Group System**: Join and manage community groups
- **Social Features**: Follow users, leave reviews, and receive notifications
- **Verification System**: User verification with document upload support
- **Real-time Notifications**: Stay updated with event and social activities

## 🏗️ Architecture

### Database Schema

The application uses a well-structured PostgreSQL database with the following main entities:

#### Core Tables

1. **Users** (`users`)
   - Primary user information (name, email, username, bio)
   - Profile images and authentication details
   - One-to-one relationship with accounts

2. **Accounts** (`accounts`)
   - OAuth provider integration (Google, etc.)
   - Links to user authentication providers

3. **Events** (`events`)
   - Event details (title, description, date, location)
   - Organized by users with participant management

4. **Groups** (`groups`)
   - Community groups for organizing events
   - Member management system

#### Relationship Tables

5. **Event Participants** (`event_participants`)
   - Many-to-many relationship between users and events
   - Tracks participation with timestamps

6. **Group Members** (`group_members`)
   - Many-to-many relationship between users and groups
   - Membership tracking with join dates

7. **Follows** (`follows`)
   - Social following system between users
   - Prevents self-follows and duplicates

#### Content & Feedback

8. **Event Reviews** (`event_reviews`)
   - User reviews and ratings for events
   - 1-5 star rating system with comments

9. **Notifications** (`notifications`)
   - User notification system
   - Read/unread status tracking

10. **Verification Requests** (`verification_requests`)
    - User verification system with document uploads
    - Status tracking (pending, approved, rejected)
    - Admin review system

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (Fast web framework)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT with Jose
- **Validation**: Zod
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LocalEve_backend
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/localeve
   JWT_SECRET=your-secret-key-here
   ```

4. **Database Setup**

   ```bash
   # Generate migrations
   bun run db:generate

   # Push schema to database
   bun run db:push

   # Seed the database with sample data
   bun run db:seed
   ```

## 🚀 Development

### Available Scripts

```bash
# Start development server
bun run dev

# Database operations
bun run db:generate    # Generate migrations
bun run db:migrate     # Run migrations
bun run db:push        # Push schema changes
bun run db:reset       # Reset database
bun run db:studio      # Open Drizzle Studio
bun run db:seed        # Seed database with sample data
```

### Database Seeding

The seed script creates realistic sample data for all tables:

- **20 Users** with complete profiles
- **15 Events** with various organizers and locations
- **12 Groups** for community organization
- **30 Event Participations** across different events
- **40 Group Memberships** with diverse user-group combinations
- **25 Event Reviews** with ratings and comments
- **35 Follow Relationships** (avoiding self-follows)
- **30 Notifications** with read/unread status
- **15 Verification Requests** with different statuses

## 📊 Database Schema Analysis

### ✅ Strengths

1. **Well-Structured Relationships**: Proper foreign key constraints and relationship definitions
2. **Comprehensive Coverage**: All major features of an event platform are covered
3. **Scalable Design**: UUID primary keys and proper indexing
4. **Data Integrity**: Proper constraints and validation
5. **Social Features**: Complete social networking capabilities

### 🔧 Recommendations

1. **Add Indexes**: Consider adding indexes on frequently queried fields:

   ```sql
   -- Add to your schema files
   email: varchar("email", { length: 255 }).unique().notNull().index(),
   username: varchar("username", { length: 50 }).unique().index(),
   ```

2. **Event Categories**: Consider adding event categories/tags for better organization
3. **Event Images**: Add support for event images/cover photos
4. **Recurring Events**: Consider support for recurring event patterns
5. **Event Capacity**: Add maximum participant limits to events
6. **Soft Deletes**: Consider soft delete patterns for important data

### 🎯 Schema Validation

Your schema is well-designed with:

- ✅ Proper primary and foreign key relationships
- ✅ Appropriate data types and constraints
- ✅ Good normalization practices
- ✅ Comprehensive coverage of use cases
- ✅ Proper timestamp tracking
- ✅ UUID usage for scalability

## 🔐 Security Considerations

1. **Input Validation**: Use Zod schemas for all API inputs
2. **Authentication**: Implement proper JWT token management
3. **Authorization**: Add role-based access control
4. **Rate Limiting**: Implement API rate limiting
5. **Data Sanitization**: Sanitize user inputs

## 🚀 Deployment

1. **Database**: Set up PostgreSQL instance
2. **Environment**: Configure production environment variables
3. **Build**: Use Bun for production builds
4. **Process Manager**: Use PM2 or similar for process management

## 📝 API Documentation

The API endpoints should be documented with:

- Request/response schemas
- Authentication requirements
- Error handling
- Rate limiting information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license information here]

---

**LocalEve** - Connecting communities through events! 🎉
