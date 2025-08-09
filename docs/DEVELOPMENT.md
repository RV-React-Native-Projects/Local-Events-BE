# 🛠️ Development Guide

Complete guide for setting up and contributing to the LocalEve backend development environment.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Bun** | 1.0+ | Fast package manager & runtime (recommended) |
| **PostgreSQL** | 14+ | Primary database |
| **Git** | 2.0+ | Version control |
| **VS Code** | Latest | Recommended editor |

### Quick Setup

```bash
# Clone repository
git clone <repository-url>
cd LocalEve_backend

# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Configure environment (edit .env)
nano .env

# Setup database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

---

## 📁 Project Structure

```
LocalEve_backend/
├── 📄 docs/                         # Documentation
│   ├── API.md                       # API reference
│   ├── DATABASE.md                  # Database schema
│   ├── AUTHENTICATION.md            # Auth system
│   └── DEVELOPMENT.md               # This file
├── 🗄️ src/
│   ├── db/                          # Database layer
│   │   ├── db.ts                    # Database connection
│   │   ├── schema/                  # Drizzle schemas
│   │   │   ├── users.ts             # User model
│   │   │   ├── events.ts            # Event model
│   │   │   ├── groups.ts            # Group model
│   │   │   └── ...                  # Other models
│   │   └── queries/                 # Database queries
│   │       ├── users.ts             # User operations
│   │       ├── events.ts            # Event operations
│   │       └── ...                  # Other operations
│   ├── middleware/                  # Express/Hono middleware
│   │   └── auth.ts                  # JWT authentication
│   ├── routes/                      # API endpoints
│   │   ├── auth.ts                  # Authentication routes
│   │   ├── events.ts                # Event routes
│   │   ├── users.ts                 # User routes
│   │   └── ...                      # Other routes
│   ├── types/                       # TypeScript definitions
│   │   ├── events.ts                # Event types
│   │   └── hono.ts                  # Hono context extensions
│   ├── utils/                       # Utility functions
│   │   ├── jwt.ts                   # JWT operations
│   │   └── crypto.ts                # Password hashing
│   └── index.ts                     # Application entry point
├── 🧪 scripts/                      # Development scripts
│   ├── seed.ts                      # Database seeding
│   └── seedV2.ts                    # Alternative seeding
├── 📮 LocalEve_Complete_API.postman_collection.json
├── 🐳 docker-compose.yaml           # Docker setup
├── ⚙️ drizzle.config.ts             # Database configuration
├── 📦 package.json                  # Dependencies
└── 🔧 tsconfig.json                 # TypeScript config
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/localeve"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server Configuration
PORT=3080
NODE_ENV=development

# Optional: OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Database Setup

#### **Local PostgreSQL**

1. **Install PostgreSQL:**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE localeve;
   CREATE USER localeve_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE localeve TO localeve_user;
   \q
   ```

3. **Update DATABASE_URL:**
   ```bash
   DATABASE_URL="postgresql://localeve_user:your_password@localhost:5432/localeve"
   ```

#### **Docker PostgreSQL**

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Or standalone Docker
docker run --name localeve-postgres \
  -e POSTGRES_DB=localeve \
  -e POSTGRES_USER=localeve_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

---

## 🏗️ Development Workflow

### Development Commands

```bash
# Development server with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Type checking
tsc --noEmit

# Code formatting
prettier --write "src/**/*.{ts,js,json}"
```

### Database Commands

```bash
# Apply schema changes to database
bun run db:push

# Generate migration files
bun run db:generate

# Apply migrations (production)
bun run db:migrate

# Open database studio in browser
bun run db:studio

# Seed database with sample data
bun run db:seed

# Reset database (drop all data)
bun run db:reset
```

### Code Quality

```bash
# Run TypeScript compiler
tsc --noEmit

# Format code
prettier --write .

# Check formatting
prettier --check .
```

---

## 🧪 Testing

### Manual Testing

#### **Using Postman**

1. **Import Collection:**
   - Import `LocalEve_Complete_API.postman_collection.json`
   - Create environment with base URL: `http://localhost:3080/api`

2. **Test Authentication:**
   ```bash
   # 1. Login with test credentials
   POST /auth/login
   {
     "email": "john@example.com",
     "password": "password123"
   }
   
   # 2. Collection automatically saves tokens
   # 3. Test protected endpoints
   GET /auth/me
   POST /events { ... }
   ```

#### **Using cURL**

```bash
# Test login
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Save token from response
TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# Test protected route
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Create event
curl -X POST http://localhost:3080/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test event description",
    "date": "2025-08-15T18:00:00.000Z",
    "location": "Test Location",
    "interests": ["Tech & Innovation"]
  }'
```

### Test Data

**Pre-seeded Test Users:**
- `john@example.com` / `password123`
- `jane@example.com` / `password123`

**Sample Data Available:**
- 20 users (2 with passwords, 18 OAuth)
- 15 events across multiple interests
- 12 groups with members
- Event participants and reviews
- Social follows and notifications

**Authentication Testing:**
```bash
# Test logout functionality
curl -X POST http://localhost:3080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"$REFRESH_TOKEN"}'

# Test that token is invalidated
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Should return 401 Unauthorized
```

---

## 🔧 Code Organization

### Adding New Features

#### **1. Database Schema**

```typescript
// src/db/schema/new_feature.ts
export const newFeature = pgTable('new_feature', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add to src/db/schema/index.ts
export * from './new_feature';
```

#### **2. Database Queries**

```typescript
// src/db/queries/new_feature.ts
export async function getAllNewFeatures() {
  return await db.select().from(newFeature);
}

export async function createNewFeature(data: CreateNewFeatureData) {
  return await db.insert(newFeature).values(data).returning();
}
```

#### **3. API Routes**

```typescript
// src/routes/new_feature.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const newFeature = new Hono();

// Validation schema
const createSchema = z.object({
  name: z.string().min(1).max(100),
});

// Routes
newFeature.get('/', async (c) => {
  const items = await getAllNewFeatures();
  return c.json({ success: true, data: items });
});

newFeature.post('/', requireAuth, zValidator('json', createSchema), async (c) => {
  const data = c.req.valid('json');
  const item = await createNewFeature(data);
  return c.json({ success: true, data: item }, 201);
});

export { newFeature };
```

#### **4. Register Routes**

```typescript
// src/routes/index.ts
import { newFeature } from './new_feature';

app.route('/new-feature', newFeature);
```

#### **5. Update Database**

```bash
# Apply schema changes
bun run db:push

# Or generate migration for production
bun run db:generate
```

### TypeScript Best Practices

#### **Type Definitions**

```typescript
// src/types/new_feature.ts
export interface NewFeature {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreateNewFeatureData {
  name: string;
}

export interface UpdateNewFeatureData {
  name?: string;
}
```

#### **Context Types**

```typescript
// src/types/hono.ts - Already configured
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthContext['user'];
  }
}
```

#### **Validation Schemas**

```typescript
// Use Zod for runtime validation
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  date: z.string().datetime(),
  optional: z.string().optional(),
});

// Extract TypeScript type
type SchemaType = z.infer<typeof schema>;
```

---

## 🐛 Debugging

### Development Tools

#### **Database Studio**
```bash
# Open visual database browser
bun run db:studio
# Opens at http://localhost:3000 or similar
```

#### **Enable Query Logging**
```typescript
// src/db/db.ts
const db = drizzle(client, { 
  schema,
  logger: true // Shows all SQL queries
});
```

#### **API Request Logging**
```typescript
// src/index.ts
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});
```

### Common Issues

#### **Database Connection**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string
psql "$DATABASE_URL" -c "SELECT 1;"
```

#### **Port Conflicts**
```bash
# Check what's using port 3080
lsof -i :3080

# Kill process if needed
kill -9 $(lsof -t -i:3080)
```

#### **TypeScript Errors**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf .tsbuildinfo

# Reinstall dependencies
bun install
```

---

## 📊 Performance Monitoring

### Development Monitoring

#### **Query Performance**
```sql
-- Enable slow query logging in PostgreSQL
SET log_min_duration_statement = 100; -- Log queries > 100ms
```

#### **Memory Usage**
```typescript
// Monitor memory in development
console.log('Memory usage:', process.memoryUsage());
```

#### **Response Times**
```typescript
// Add timing middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${duration}ms`);
});
```

---

## 🚀 Deployment Preparation

### Build Process

```bash
# Install production dependencies only
bun install --production

# Build TypeScript
bun run build

# Run database migrations
bun run db:migrate

# Start production server
bun run start
```

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="secure-random-secret-64-chars"
REFRESH_SECRET="another-secure-random-secret-64-chars"
PORT=3080
```

### Docker Deployment

```dockerfile
# Dockerfile (create if needed)
FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun run build

EXPOSE 3080

CMD ["bun", "run", "start"]
```

---

## 🤝 Contributing Guidelines

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Commit Convention

```bash
# Use conventional commits
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: improve code structure
test: add tests
chore: update dependencies
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier configuration
- **Naming**: camelCase for variables, PascalCase for types
- **Comments**: JSDoc for functions
- **Error Handling**: Always handle errors gracefully

### Pull Request Checklist

- [ ] Code compiles without TypeScript errors
- [ ] All new routes are documented
- [ ] Database migrations are included if needed
- [ ] Postman collection is updated for new endpoints
- [ ] Environment variables are documented
- [ ] Manual testing completed

This development guide ensures consistent, maintainable, and scalable development practices for the LocalEve backend.
