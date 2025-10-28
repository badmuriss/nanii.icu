# naniiicu - Modern URL Shortener

A powerful, modern URL shortener and link hub creator built with React, TypeScript, Express, and MongoDB. Create both single short URLs and multi-link hubs with real-time availability checking, comprehensive analytics, and a sleek design with modern typography.

![naniiicu](https://img.shields.io/badge/naniiicu-URL%20Shortener-yellow?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## Features

- **Dual Mode Operation** - Single URL shortening or multi-link hub creation
- **Link Hubs** - Create organized collections of multiple links with titles and descriptions
- **Modern Design** - Clean, responsive UI with Inter typography
- **Real-time Validation** - Instant custom URL availability checking for both URLs and hubs
- **Analytics** - Comprehensive click tracking and statistics
- **Security** - Rate limiting, CORS protection, input validation
- **Fully Customizable Names** - Create memorable short links and hub names
- **Mobile Responsive** - Optimized for all device sizes
- **Docker Ready** - Easy deployment with Docker containers
- **MongoDB Database** - Scalable and robust document database
- **Health Monitoring** - Built-in health checks for all services
- **Multi-language Support** - Portuguese, English, and Spanish interfaces

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd naniiicu
   ```

2. **Start with Docker:**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - MongoDB: localhost:27017
   - Health Check: http://localhost:3001/health

### Development Setup

1. **Install dependencies:**
   ```bash
   # Frontend
   cd naniiicu-app && npm install

   # Backend
   cd ../backend && npm install
   ```

2. **Set up MongoDB and environment variables:**
   ```bash
   # Start MongoDB locally or use Docker
   docker run -d --name mongodb -p 27017:27017 mongo:7.0

   # Backend
   cp backend/.env.example backend/.env
   # Edit .env with your MongoDB connection string
   ```

3. **Start development servers:**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev

   # Frontend (Terminal 2)
   cd naniiicu-app && npm run dev
   ```

## Architecture

### Project Structure
```
naniiicu/
├── naniiicu-app/          # Frontend React app
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utilities
├── backend/               # Express API server
│   ├── src/routes/        # API endpoints
│   ├── src/database/      # Database layer
│   └── src/middleware/    # Express middleware
├── mongodb-data/          # MongoDB volume data
└── docker-compose.yml     # Container orchestration
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS with modern design system
- Vite for build tooling
- Inter typography via npm packages
- Real-time form validation

**Backend:**
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose ODM
- Zod for validation
- Rate limiting & security middleware

**Infrastructure:**
- Docker & Docker Compose
- MongoDB 7.0 database
- Nginx for serving frontend
- Health checks & monitoring

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
MONGO_URI=mongodb://admin:password@mongodb:27017/naniiicu?authSource=admin
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BASE_URL=https://your-domain.com
```

### Docker Environment Variables

Set these in your deployment platform (Coolify):

```env
CORS_ORIGIN=https://your-domain.com
BASE_URL=https://your-domain.com
MONGO_URI=mongodb://admin:password@mongodb:27017/naniiicu?authSource=admin
```

## API Endpoints

### URL Endpoints

- `POST /api/links` - Create short URL
- `POST /api/links/check-availability` - Check custom name availability
- `GET /api/links/:shortName/stats` - Get URL statistics
- `GET /api/links` - List all URLs

### Hub Endpoints

- `POST /api/hubs` - Create link hub
- `POST /api/hubs/check-availability` - Check hub name availability
- `GET /api/hubs/:hubName` - Get hub details
- `GET /api/hubs/:hubName/stats` - Get hub statistics
- `GET /api/hubs` - List all hubs

### Core Endpoints

- `GET /:shortName` - Redirect to URL or display hub
- `GET /health` - Health check

### Example Usage

**Create a short URL:**
```bash
curl -X POST http://localhost:3001/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "customName": "mylink"}'
```

**Create a link hub:**
```bash
curl -X POST http://localhost:3001/api/hubs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Links",
    "description": "Collection of useful links",
    "customName": "mylinks",
    "links": [
      {"title": "Google", "url": "https://google.com", "order": 0},
      {"title": "GitHub", "url": "https://github.com", "order": 1}
    ]
  }'
```

**Check availability:**
```bash
# For URLs
curl -X POST http://localhost:3001/api/links/check-availability \
  -H "Content-Type: application/json" \
  -d '{"customName": "mylink"}'

# For hubs
curl -X POST http://localhost:3001/api/hubs/check-availability \
  -H "Content-Type: application/json" \
  -d '{"customName": "mylinks"}'
```

## Deployment

### Coolify Deployment

1. **Connect your repository** to Coolify
2. **Set environment variables:**
   - `CORS_ORIGIN`: Your domain (e.g., `https://nanii.icu`)
   - `BASE_URL`: Your domain (e.g., `https://nanii.icu`)
3. **Deploy** using the included `docker-compose.yml`

### Manual Deployment

```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Health Monitoring

Both services include health checks:
- Frontend: `wget` check on port 80
- Backend: API health endpoint check
- Database: Automatic backup service

## Features Deep Dive

### Link Hubs
- Create collections of multiple links with titles
- Optional descriptions and custom hub names
- Organized display with click tracking
- Support for up to 10 links per hub
- Beautiful hub display pages

### Custom URLs and Hub Names
- Real-time availability checking with 500ms debounce
- Alphanumeric, hyphen, and underscore support
- Reserved word protection
- Length validation (3-50 characters)
- Separate namespaces for URLs and hubs

### Analytics
- Click tracking with timestamps
- Geographic and referrer data collection
- Daily, weekly, and monthly statistics
- Recent clicks history

### Security
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation and sanitization
- SQL injection protection
- XSS prevention headers

## Development

### Available Scripts

**Frontend (`naniiicu-app/`):**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

**Backend (`backend/`):**
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests

### Code Style
- TypeScript strict mode
- ESLint with React and TypeScript rules
- Tailwind CSS for styling
- Modern ES6+ features

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :8080

# Change ports in docker-compose.yml if needed
```

**Database issues:**
```bash
# Reset MongoDB data
docker-compose down -v
docker-compose up --build

# Access MongoDB directly
docker exec -it naniiicu-mongodb mongosh -u admin -p password
```

**CORS errors:**
- Ensure `CORS_ORIGIN` matches your frontend URL
- Check that both services are running

## Performance

- Frontend assets cached with proper headers
- Gzip compression enabled
- Database indexes on frequently queried columns
- Rate limiting to prevent abuse
- Health checks for reliability

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Documentation](CLAUDE.md) - Detailed development guide
- [API Reference](CLAUDE.md#-api-documentation) - Complete API documentation
- [Docker Hub](https://hub.docker.com) - Container registry

## Features Roadmap

- [ ] QR Code generation for URLs and hubs
- [ ] Bulk URL import/export
- [ ] User accounts and dashboards
- [ ] Advanced analytics dashboard
- [ ] API keys for external access
- [ ] Webhook notifications
- [ ] Custom domains support
- [ ] Hub themes and customization
- [ ] Link scheduling and expiration
- [ ] Social media integration

---

Made with modern web technologies