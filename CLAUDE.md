# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

naniiicu is a modern URL shortener and link hub creator with dual-mode operation: single URL shortening or multi-link hub creation. Built with React, TypeScript, Express, MongoDB, and Docker.

**Key Features:**
- Dual-mode operation: single URLs or link hubs (up to 10 links)
- Real-time custom name availability checking (500ms debounce)
- Unified namespace prevents URL/hub name conflicts
- Comprehensive analytics with click tracking
- Multi-language support (Portuguese, English, Spanish)
- Inter font typography via npm packages
- Docker containerization with health checks
- MongoDB with Mongoose ODM

## Project Structure

```
naniiicu/
├── naniiicu-app/          # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # React components (Header, Footer, UrlShortener, HubDisplay)
│   │   ├── hooks/         # Custom hooks (useI18n, useTheme)
│   │   ├── lib/           # Utilities (api.ts - all backend communication, i18n.ts)
│   │   ├── pages/         # Page components (Index, NotFound)
│   │   └── contexts/      # React contexts (I18nProvider)
│   ├── Dockerfile         # Production: nginx
│   └── nginx.conf         # Frontend serving config
├── backend/               # Backend Express API + TypeScript
│   ├── src/
│   │   ├── config/        # environment.ts - config loading
│   │   ├── database/      # models.ts, queries.ts (UnifiedQueries, UrlQueries, HubQueries), connection.ts
│   │   ├── middleware/    # errorHandler.ts
│   │   ├── routes/        # urls.ts, hubs.ts, redirect.ts, health.ts
│   │   └── server.ts      # Express app setup with rate limiting, CORS, helmet
│   └── Dockerfile         # Production: Node.js
├── mongodb-data/          # MongoDB volume data (gitignored)
└── docker-compose.yml     # Production orchestration with mongo-express
```

## Development Commands

### Frontend (naniiicu-app/)
```bash
npm run dev           # Vite dev server on http://localhost:8080
npm run build         # Production build
npm run build:dev     # Development build
npm run lint          # ESLint
npm run preview       # Preview production build
```

### Backend (backend/)
```bash
npm run dev           # tsx watch mode - hot reload on http://localhost:3001
npm run build         # Compile TypeScript to dist/
npm run start         # Production: node dist/server.js
npm run lint          # ESLint
npm run test          # Vitest
```

### Docker
```bash
# Production
docker-compose up --build -d
docker-compose logs -f [service-name]
docker-compose down

# Individual services
docker-compose build [frontend|backend|mongodb]
docker-compose restart [service-name]

# Database access
docker exec -it naniiicu-mongodb mongosh -u admin -p password

# DANGER: Reset database
docker-compose down -v
```

## Architecture Details

### Backend Architecture

**Server Setup (server.ts):**
- Express with helmet (CSP disabled), CORS (multi-origin support), rate limiting (100 req/15min)
- JSON body parsing (10mb limit)
- Route mounting: `/health`, `/api/links`, `/api/hubs`, `/` (redirect)
- Error handling: notFoundHandler → errorHandler middleware

**Database Layer:**
- `models.ts`: Mongoose schemas for Url, Click, Hub collections
- `queries.ts`: Three singleton classes:
  - `UnifiedQueries`: Shared namespace logic, checks both URL/hub collections for conflicts
  - `UrlQueries`: URL CRUD, stats calculation (daily/weekly/monthly)
  - `HubQueries`: Hub CRUD, basic stats
- Reserved names: api, admin, dashboard, login, etc. (blocked globally)
- Custom name validation: 3-50 chars, alphanumeric + hyphens + underscores

**Key Models:**
- **Url**: `shortName` (unique), `originalUrl`, `customName` (optional), `clickCount`, `isActive`, timestamps
- **Hub**: `hubName` (unique), `title`, `description`, `links[]`, `customName` (optional), `clickCount`, timestamps
- **Click**: `urlId`, `clickedAt`, `userIp`, `userAgent`, `referrer`, `country`

**Indexes**: Compound indexes on `shortName`/`hubName` + `isActive` for fast lookups

### Frontend Architecture

**API Communication (`lib/api.ts`):**
- Single source of truth for all backend calls
- Base URL: `VITE_API_URL` env var or `http://localhost:3001`
- Exports: `urlApi`, `hubApi`, `healthApi`
- Custom `ApiError` class with status codes

**Component Structure:**
- `UrlShortener.tsx`: Dual-mode component (URL vs Hub tabs) with real-time availability checking
- `HubDisplay.tsx`: Renders hub pages when accessing `/:hubName`
- `Header.tsx`: Logo, theme toggle, language selector
- `Footer.tsx`: Copyright, branding
- UI components: shadcn/ui with Radix primitives + Tailwind

**State Management:**
- React Context for i18n (`I18nProvider`)
- Theme: `next-themes` package
- No global state manager - component-level state with hooks

**Routing:**
- `react-router-dom` with routes: `/` (Index), `/404` (NotFound)
- Hub display is handled by backend redirect logic

### Database Design

**MongoDB Collections:**

```javascript
// urls collection
{
  _id: ObjectId,
  shortName: String (unique, indexed),
  originalUrl: String,
  customName: String (sparse index),
  clickCount: Number,
  createdAt: Date (indexed),
  updatedAt: Date,
  expiresAt: Date (indexed),
  isActive: Boolean (indexed),
  userIp: String,
  userAgent: String
}

// hubs collection
{
  _id: ObjectId,
  hubName: String (unique, indexed),
  title: String,
  description: String,
  links: [{
    title: String,
    url: String,
    order: Number
  }],
  customName: String (sparse index),
  clickCount: Number,
  createdAt: Date (indexed),
  updatedAt: Date,
  expiresAt: Date (indexed),
  isActive: Boolean (indexed),
  userIp: String,
  userAgent: String
}

// clicks collection
{
  _id: ObjectId,
  urlId: ObjectId (ref: Url, indexed),
  clickedAt: Date (indexed),
  userIp: String,
  userAgent: String,
  referrer: String,
  country: String
}
```

**Key Constraints:**
- Unified namespace: URL and hub names cannot conflict
- Custom names are optional - auto-generated with nanoid(8) if not provided
- Soft deletes via `isActive: false`

## API Endpoints

### URL Endpoints
- `POST /api/links` - Create short URL
- `POST /api/links/check-availability` - Check custom name availability
- `GET /api/links/:shortName/stats` - Get URL statistics
- `GET /api/links?limit=100&offset=0` - List URLs (max 100)

### Hub Endpoints
- `POST /api/hubs` - Create link hub
- `POST /api/hubs/check-availability` - Check hub name availability
- `GET /api/hubs/:hubName` - Get hub details
- `GET /api/hubs/:hubName/stats` - Get hub statistics
- `GET /api/hubs?limit=100&offset=0` - List hubs (max 100)

### Core Endpoints
- `GET /:shortName` - Redirect to URL or display hub (increments `clickCount`)
- `GET /health` - Health check (includes database status)

### Request/Response Examples

**Create Short URL:**
```bash
curl -X POST http://localhost:3001/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "customName": "mylink"}'

# Response:
{
  "success": true,
  "data": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "shortName": "mylink",
    "originalUrl": "https://example.com",
    "customName": "mylink",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "clickCount": 0
  }
}
```

**Create Hub:**
```bash
curl -X POST http://localhost:3001/api/hubs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Links",
    "description": "Useful resources",
    "customName": "mylinks",
    "links": [
      {"title": "Google", "url": "https://google.com", "order": 0},
      {"title": "GitHub", "url": "https://github.com", "order": 1}
    ]
  }'
```

**Check Availability:**
```bash
# URLs
curl -X POST http://localhost:3001/api/links/check-availability \
  -H "Content-Type: application/json" \
  -d '{"customName": "mylink"}'

# Hubs
curl -X POST http://localhost:3001/api/hubs/check-availability \
  -H "Content-Type: application/json" \
  -d '{"customName": "mylinks"}'

# Response:
{
  "success": true,
  "data": {
    "customName": "mylink",
    "available": true,
    "reason": null
  }
}
```

## Environment Variables

### Backend (.env)
```bash
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080,http://localhost:8082
MONGO_URI=mongodb://admin:password@mongodb:27017/naniiicu?authSource=admin
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
BASE_URL=http://localhost:3001      # Used for generating short URLs
```

### Frontend
- `VITE_API_URL`: Backend API URL (defaults to `http://localhost:3001`)

### Docker Compose Variables
```bash
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=naniiicu
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080
BASE_URL=http://localhost:3001
```

## Key Implementation Details

### Custom Name Availability Checking
- Frontend: 500ms debounce to prevent excessive API calls
- Backend: `UnifiedQueries.checkNameAvailability()` checks both collections
- Validation: 3-50 chars, alphanumeric + hyphens + underscores, not reserved
- Real-time feedback via API

### Redirect Logic (routes/redirect.ts)
1. Parse `/:shortName` from request
2. Check URL collection first (`getUrlByShortName`)
3. If found: increment click count, create click record, redirect (302)
4. If not found: check Hub collection (`getHubByName`)
5. If hub found: increment click count, return hub data (frontend renders)
6. If neither found: 404

### Hub Creation Flow
1. Validate: title required, at least 1 link, max 10 links
2. Validate each link URL format
3. Check custom name availability (if provided)
4. Generate hubName (custom or auto with nanoid)
5. Sort links by order field
6. Save to MongoDB
7. Return hub data with generated hubName

### Click Analytics
- URL clicks: tracked in `clicks` collection with timestamps, user info
- Hub clicks: incremented in hub document (no detailed click tracking yet)
- Stats calculated on-demand: today (since midnight), week (7 days), month (current month)
- Recent clicks: last 10 with details

### I18n Implementation
- `lib/i18n.ts`: Translation dictionaries for pt/en/es
- `contexts/I18nProvider.tsx`: Context provider with localStorage persistence
- `hooks/useI18n.ts`: Hook for accessing translations
- Components use `t('key')` for all user-facing strings

## Testing

```bash
# Backend tests
cd backend
npm run test              # Run all tests
npm run test -- --watch   # Watch mode

# Frontend tests (if configured)
cd naniiicu-app
npm run test
```

## Linting

```bash
# Both projects use ESLint with TypeScript
cd backend && npm run lint
cd naniiicu-app && npm run lint

# Auto-fix
npm run lint -- --fix
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check logs
docker-compose logs mongodb

# Verify connection string
echo $MONGO_URI

# Test connection
docker exec -it naniiicu-mongodb mongosh -u admin -p password --eval "db.adminCommand('ping')"

# Reset (DANGER: deletes all data)
docker-compose down -v
docker-compose up --build -d
```

### CORS Errors
- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Check server logs: backend prints allowed origins and request origins
- Multiple origins: comma-separated string in env var

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3001    # Backend
lsof -i :8080    # Frontend
lsof -i :27017   # MongoDB

# Kill process
kill -9 <PID>
```

### Database Queries Not Working
- Check indexes: `db.urls.getIndexes()` in mongosh
- Verify `isActive: true` filter is applied
- Check for soft-deleted records

## Deployment Considerations

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure proper `BASE_URL` (your domain)
3. Set secure `CORS_ORIGIN` (your domain)
4. Use strong MongoDB credentials
5. Enable HTTPS (not included - use reverse proxy)
6. Set up MongoDB backups
7. Configure health check monitoring
8. Review rate limits for your traffic

### Docker Production
```bash
# Start all services
docker-compose up --build -d

# Check health
curl http://localhost:3001/health
curl http://localhost:8080/

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Scale backend (with load balancer)
docker-compose up --scale backend=3
```

### Mongo Express (Database UI)
- URL: http://localhost:8081
- Username: admin (or `MONGO_INITDB_ROOT_USERNAME`)
- Password: admin (or `MONGO_INITDB_ROOT_PASSWORD`)
- **IMPORTANT:** Disable in production or secure with proper auth

## Important Notes

- **Unified Namespace:** URL and hub custom names share the same namespace - conflicts are prevented globally
- **Reserved Names:** Hardcoded list in `queries.ts` - update `isReservedName()` to add more
- **Auto-generated Names:** Use nanoid(8) - generates 8-char alphanumeric IDs
- **Soft Deletes:** Records are marked `isActive: false` rather than deleted
- **Rate Limiting:** Applied to all `/api/*` routes - adjust in `server.ts`
- **Click Tracking:** URLs have detailed tracking, hubs only have basic counter (enhancement opportunity)
- **Link Limit:** Hubs support up to 10 links - enforced in validation
- **Custom Name Debounce:** Frontend waits 500ms after typing stops before checking availability
- **Database Indexes:** Pre-configured on all frequently queried fields - no manual setup needed
- **Module System:** Backend uses ES modules (`"type": "module"` in package.json) - all imports need `.js` extension

## Adding New Features

### Adding a New API Endpoint
1. Define interface in `backend/src/database/models.ts`
2. Add query method in appropriate class in `backend/src/database/queries.ts`
3. Create route handler in `backend/src/routes/[resource].ts`
4. Update router exports in `backend/src/server.ts`
5. Add API method in `naniiicu-app/src/lib/api.ts`
6. Add translation keys in `naniiicu-app/src/lib/i18n.ts`
7. Update this documentation

### Adding a New Translation
1. Add key to `Translations` interface in `lib/i18n.ts`
2. Add translations for all three languages (pt, en, es)
3. Use in components via `t('new_key')`

### Adding a New Reserved Name
1. Update `isReservedName()` array in `backend/src/database/queries.ts`
2. No database migration needed - validation happens at create time
