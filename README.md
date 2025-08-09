# 🌟 LocalEve Backend API

**A comprehensive event management platform backend with JWT authentication, social features, and real-time notifications.**

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Technology Stack](#-technology-stack)
- [📖 Documentation](#-documentation)
- [🛠️ Development Setup](#️-development-setup)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LocalEve_backend

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

### Test the API

```bash
# Test login
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Test protected route
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🏗️ Project Structure

```
LocalEve_backend/
├── 📚 docs/                     # Detailed documentation
│   ├── API.md                   # API endpoints documentation
│   ├── DATABASE.md              # Database schema and relationships
│   ├── AUTHENTICATION.md        # JWT authentication guide
│   ├── DEPLOYMENT.md            # Deployment instructions
│   └── DEVELOPMENT.md           # Development workflow
├── 🗄️ src/
│   ├── db/                      # Database layer
│   │   ├── queries/             # Database query functions
│   │   └── schema/              # Drizzle ORM schemas
│   ├── middleware/              # Express/Hono middleware
│   ├── routes/                  # API route handlers
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── 🧪 scripts/                  # Database seeding scripts
├── 📮 postman/                  # Postman collection
└── 🐳 docker-compose.yaml       # Docker configuration
```

## 🔧 Technology Stack

### **Backend Framework**

- **[Hono](https://hono.dev/)** - Fast web framework for TypeScript
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### **Database & ORM**

- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL toolkit
- **[Drizzle Kit](https://github.com/drizzle-team/drizzle-kit-mirror)** - Database migrations

### **Authentication & Security**

- **[JOSE](https://github.com/panva/jose)** - JWT token generation/validation
- **Web Crypto API** - Password hashing (PBKDF2)
- **[Zod](https://zod.dev/)** - Runtime type validation

### **Development Tools**

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime
- **[Prettier](https://prettier.io/)** - Code formatting
- **TypeScript** - Static type checking

## 📖 Documentation

### 📁 Documentation Structure

Our comprehensive documentation is organized into focused guides to help you understand and work with the LocalEve backend:

| Document                                              | Content Overview                                                                                                                                                               | When to Use                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **[🔗 API Documentation](docs/API.md)**               | **Complete REST API reference**<br/>• All 73+ endpoints with examples<br/>• Request/response formats<br/>• Authentication requirements<br/>• Error codes and handling          | Use when integrating with the API, testing endpoints, or understanding request/response formats |
| **[🗄️ Database Schema](docs/DATABASE.md)**            | **Database design & relationships**<br/>• PostgreSQL schema definitions<br/>• Table relationships and indexes<br/>• Query patterns and examples<br/>• Performance optimization | Use when understanding data structure, writing queries, or designing new features               |
| **[🔐 Authentication Guide](docs/AUTHENTICATION.md)** | **JWT authentication system**<br/>• Token structure and lifecycle<br/>• Login/logout flows<br/>• Token blacklisting system<br/>• Security best practices                       | Use when implementing authentication, handling user sessions, or troubleshooting auth issues    |
| **[⚙️ Development Workflow](docs/DEVELOPMENT.md)**    | **Local development setup**<br/>• Environment configuration<br/>• Code organization patterns<br/>• Testing strategies<br/>• Debugging techniques                               | Use when setting up local development, adding new features, or contributing to the project      |
| **[🚀 Deployment Guide](docs/DEPLOYMENT.md)**         | **Production deployment**<br/>• Platform-specific instructions<br/>• Security hardening<br/>• Performance optimization<br/>• Monitoring and maintenance                        | Use when deploying to production, scaling the application, or setting up CI/CD                  |

### 🗺️ Documentation Navigation Guide

**🚀 Quick Start Path:**

1. **First time?** → Start with this README for project overview
2. **Setting up locally?** → Follow [Development Workflow](docs/DEVELOPMENT.md)
3. **Using the API?** → Reference [API Documentation](docs/API.md)
4. **Deploying?** → Follow [Deployment Guide](docs/DEPLOYMENT.md)

**🔍 Deep Dive Path:**

1. **Understanding data flow?** → [Database Schema](docs/DATABASE.md)
2. **Implementing auth?** → [Authentication Guide](docs/AUTHENTICATION.md)
3. **Adding features?** → [Development Workflow](docs/DEVELOPMENT.md)
4. **Production issues?** → [Deployment Guide](docs/DEPLOYMENT.md)

### 📋 Documentation Features

Each documentation file includes:

- ✅ **Practical examples** with copy-paste code
- ✅ **Step-by-step instructions** for common tasks
- ✅ **Troubleshooting sections** for common issues
- ✅ **Best practices** and security recommendations
- ✅ **Updated information** verified against current implementation

## 🛠️ Development Setup

### 1. **Environment Configuration**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/localeve"

# JWT Secrets (change in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server
PORT=3080
NODE_ENV=development
```

### 2. **Database Setup**

```bash
# Push schema to database
bun run db:push

# Seed with sample data
bun run db:seed

# View database in browser
bun run db:studio
```

### 3. **Development Commands**

```bash
# Start development server with hot reload
bun run dev

# Type checking
tsc --noEmit

# Database operations
bun run db:push      # Apply schema changes
bun run db:studio    # Open database browser
bun run db:seed      # Seed sample data
bun run db:reset     # Reset database
```

## 🧪 Testing

### **Manual Testing**

1. **Import Postman Collection**

   ```bash
   # Import LocalEve_Complete_API.postman_collection.json
   # Set environment variables in Postman
   ```

2. **Test Authentication Flow**
   ```bash
   # 1. Login to get JWT tokens
   # 2. Use tokens for protected routes
   # 3. Refresh tokens when needed
   ```

### **Test Credentials**

```bash
# Password-based login
Email: john@example.com
Password: password123

# Alternative test user
Email: jane@example.com
Password: password123
```

## 🚀 Deployment

### **Production Environment**

1. **Environment Variables**

   ```bash
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="secure-random-secret"
   REFRESH_SECRET="another-secure-random-secret"
   ```

2. **Database Migration**

   ```bash
   bun run db:push
   ```

3. **Start Server**
   ```bash
   bun run start
   ```

### **Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🌟 Features

### **🔐 Authentication**

- **JWT-based authentication** with access & refresh tokens
- **Token blacklisting system** for secure logout
- **Session-specific logout** (current device) & **global logout** (all devices)
- **Password-based login** with secure PBKDF2 hashing
- **OAuth integration** (Google, GitHub, etc.)
- **Protected routes** with middleware

### **📅 Event Management**

- **CRUD operations** for events
- **Search & filtering** by location, interests, date
- **Event participation** (join/leave)
- **Event reviews & ratings**
- **Interest-based categorization**

### **👥 User Management**

- **User profiles** with bio, avatar, stats
- **User search** and discovery
- **Event history** and participation tracking

### **🤝 Social Features**

- **Follow/unfollow** users
- **Social feed** with user activities
- **Event reviews** and ratings
- **User interactions** tracking

### **👫 Group Management**

- **Create & manage groups**
- **Group membership** (join/leave)
- **Group-based events** and activities

### **🔔 Notifications**

- **Real-time notifications** for events
- **Notification management** (read/unread)
- **Bulk operations** (mark all as read)

### **✅ Verification System**

- **User verification** requests
- **Document upload** support
- **Admin approval** workflow
- **Status tracking** (pending/approved/rejected)

## 📊 API Statistics

- **73+ Total Endpoints**
- **8 Authentication routes** (including logout variants)
- **16 Event management routes**
- **9 User management routes**
- **9 Group management routes**
- **9 Social feature routes**
- **7 Notification routes**
- **10 Verification routes**
- **5+ Additional utility routes**

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### **Development Guidelines**

- Follow **TypeScript** best practices
- Use **conventional commits**
- Add **JSDoc comments** for functions
- Update **documentation** for new features
- Test **API endpoints** before submitting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Open a GitHub issue
- **Questions**: Contact the development team

---

**🌟 Star this repository if you find it helpful!**
