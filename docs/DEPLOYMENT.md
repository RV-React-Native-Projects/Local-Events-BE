# 🚀 Deployment Guide

Complete guide for deploying LocalEve backend to production environments.

## 🎯 Deployment Overview

The LocalEve backend can be deployed to various platforms:
- **Cloud Providers**: AWS, Google Cloud, Azure
- **Platform-as-a-Service**: Vercel, Railway, Render
- **Container Platforms**: Docker, Kubernetes
- **VPS/Dedicated Servers**: Ubuntu, CentOS, etc.

---

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements

- [ ] **JWT Secrets**: Generate secure random secrets (64+ characters)
- [ ] **Environment Variables**: Never commit secrets to version control
- [ ] **Database**: Use SSL/TLS for database connections
- [ ] **HTTPS**: Ensure HTTPS is enforced in production
- [ ] **CORS**: Configure appropriate CORS settings
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints

### ✅ Performance Requirements

- [ ] **Database Indexes**: Ensure all necessary indexes are created
- [ ] **Connection Pooling**: Configure database connection pooling
- [ ] **Caching**: Consider Redis for session/cache storage
- [ ] **CDN**: Set up CDN for static assets if needed
- [ ] **Monitoring**: Set up logging and monitoring

### ✅ Configuration Requirements

- [ ] **Environment Variables**: All production values set
- [ ] **Database Migrations**: All migrations applied
- [ ] **Build Process**: TypeScript compiled successfully
- [ ] **Dependencies**: Only production dependencies installed
- [ ] **Health Checks**: Implement health check endpoints

---

## 🌐 Platform-Specific Deployments

### 🚀 Vercel Deployment

**Best for**: Serverless deployment with automatic scaling

#### **Setup Steps**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy:**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   
   # Set environment variables
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add REFRESH_SECRET
   ```

#### **Database Setup**
```bash
# Use Vercel Postgres or external provider
vercel storage create postgres
# Or connect to external PostgreSQL (recommended)
```

### 🚂 Railway Deployment

**Best for**: Simple deployment with managed PostgreSQL

#### **Setup Steps**

1. **Connect GitHub Repository:**
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub
   - Select your repository

2. **Add PostgreSQL:**
   ```bash
   # Railway automatically provisions PostgreSQL
   # DATABASE_URL is automatically set
   ```

3. **Set Environment Variables:**
   ```bash
   # In Railway dashboard, add:
   NODE_ENV=production
   JWT_SECRET=your-secure-secret
   REFRESH_SECRET=your-secure-refresh-secret
   PORT=3080
   ```

4. **Deploy:**
   ```bash
   # Automatic deployment on git push
   git push origin main
   ```

### 🖥️ DigitalOcean Droplet

**Best for**: Full control over server environment

#### **Server Setup**

1. **Create Droplet:**
   ```bash
   # Ubuntu 22.04 LTS (recommended)
   # Minimum: 2GB RAM, 1 vCPU
   # Recommended: 4GB RAM, 2 vCPU
   ```

2. **Initial Server Configuration:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js and Bun
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Install Nginx (reverse proxy)
   sudo apt install nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   
   # Install Certbot (SSL certificates)
   sudo apt install certbot python3-certbot-nginx
   ```

3. **Database Setup:**
   ```bash
   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE localeve;
   CREATE USER localeve_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE localeve TO localeve_user;
   \q
   ```

4. **Application Deployment:**
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/localeve
   cd /var/www/localeve
   
   # Install dependencies
   bun install --production
   
   # Build application
   bun run build
   
   # Set up environment
   sudo nano .env.production
   ```

5. **Environment Configuration:**
   ```bash
   # .env.production
   NODE_ENV=production
   DATABASE_URL="postgresql://localeve_user:secure_password@localhost:5432/localeve"
   JWT_SECRET="your-64-character-random-secret"
   REFRESH_SECRET="another-64-character-random-secret"
   PORT=3080
   ```

6. **Process Manager (PM2):**
   ```bash
   # Install PM2
   bun install -g pm2
   
   # Create ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'localeve-api',
       script: 'bun',
       args: 'run start',
       cwd: '/var/www/localeve',
       env_production: {
         NODE_ENV: 'production',
         PORT: 3080
       },
       instances: 'max',
       exec_mode: 'cluster',
       watch: false,
       max_memory_restart: '1G',
       error_file: '/var/log/localeve/error.log',
       out_file: '/var/log/localeve/out.log',
       log_file: '/var/log/localeve/combined.log',
       time: true
     }]
   };
   EOF
   
   # Create log directory
   sudo mkdir -p /var/log/localeve
   sudo chown -R $USER:$USER /var/log/localeve
   
   # Start application
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

7. **Nginx Configuration:**
   ```bash
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/localeve
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/localeve /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **SSL Certificate:**
   ```bash
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   
   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### 🐳 Docker Deployment

**Best for**: Containerized deployment across any platform

#### **Dockerfile**

```dockerfile
# Multi-stage build for optimal image size
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun run build

# Production image
FROM oven/bun:latest AS production

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Expose port
EXPOSE 3080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3080/health || exit 1

# Start application
CMD ["bun", "run", "start"]
```

#### **Docker Compose**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3080:3080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/localeve
      - JWT_SECRET=${JWT_SECRET}
      - REFRESH_SECRET=${REFRESH_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - localeve-network

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=localeve
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - localeve-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - localeve-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  localeve-network:
    driver: bridge
```

#### **Deployment Commands**

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Database migrations
docker-compose -f docker-compose.prod.yml exec app bun run db:migrate
```

---

## 🗄️ Database Migration in Production

### Pre-Migration Steps

```bash
# 1. Backup existing database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migrations on staging
DATABASE_URL=$STAGING_DATABASE_URL bun run db:migrate

# 3. Check application compatibility
DATABASE_URL=$STAGING_DATABASE_URL bun run start
```

### Running Migrations

```bash
# 1. Put application in maintenance mode (if needed)
pm2 stop localeve-api

# 2. Run migrations
bun run db:migrate

# 3. Verify migration success
bun run db:studio

# 4. Restart application
pm2 start localeve-api
```

### Rollback Plan

```bash
# If migration fails, restore from backup
psql $DATABASE_URL < backup_20231208_120000.sql

# Revert to previous application version
git checkout previous-tag
bun install --production
bun run build
pm2 restart localeve-api
```

---

## 📊 Monitoring & Logging

### Health Check Endpoint

```typescript
// Add to src/index.ts
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

### Logging Configuration

```typescript
// Enhanced logging for production
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Monitoring Tools

#### **Application Monitoring**
```bash
# PM2 monitoring
pm2 monit

# System monitoring
htop
iostat
netstat
```

#### **Database Monitoring**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('localeve'));
```

---

## ⚡ Performance Optimization

### Application Level

```typescript
// Connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Database Level

```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_location ON events(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_interests ON events USING GIN(interests);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
```

### Caching Strategy

```typescript
// Redis caching (optional)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache frequently accessed data
const cacheKey = `events:upcoming:${page}:${limit}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const events = await getUpcomingEvents(page, limit);
await redis.setex(cacheKey, 300, JSON.stringify(events)); // 5 min cache
```

---

## 🛡️ Security Hardening

### Server Security

```bash
# Firewall configuration
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh

# Automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### Application Security

```typescript
// Security headers
app.use('*', async (c, next) => {
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  await next();
});

// Rate limiting
import { rateLimiter } from 'hono-rate-limiter';

app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
}));
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      
    - name: Install dependencies
      run: bun install
      
    - name: Run tests
      run: bun test
      
    - name: Build application
      run: bun run build
      
    - name: Deploy to production
      run: |
        # Your deployment script here
        ssh user@server 'cd /var/www/localeve && git pull && bun install --production && bun run build && pm2 restart localeve-api'
```

---

## 🆘 Troubleshooting

### Common Issues

#### **Application Won't Start**
```bash
# Check logs
pm2 logs localeve-api

# Check environment variables
pm2 env 0

# Check port availability
netstat -tulpn | grep :3080
```

#### **Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection limits
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

#### **SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### Performance Issues

```bash
# Check system resources
htop
df -h
free -m

# Check application performance
pm2 monit

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

This deployment guide covers the most common deployment scenarios and provides a solid foundation for running LocalEve backend in production environments.
