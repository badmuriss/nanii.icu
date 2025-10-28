# naniiicu - Modern URL Shortener

A powerful, modern URL shortener and link hub creator built with React, TypeScript, Express, and MongoDB.

![naniiicu](https://img.shields.io/badge/naniiicu-URL%20Shortener-yellow?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## Features

- **Single URL Shortening** - Create memorable short links with custom names
- **Link Hubs** - Create organized collections of multiple links (up to 10 per hub)
- **QR Code Generation** - Download QR codes for any shortened URL or hub
- **Real-time Validation** - Instant custom name availability checking
- **Analytics** - Comprehensive click tracking and statistics
- **Multi-language Support** - Portuguese, English, and Spanish interfaces
- **Modern Design** - Clean, responsive UI with Inter typography
- **Security** - Rate limiting, CORS protection, input validation
- **Docker Ready** - Easy deployment with Docker Compose

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and start
git clone <repository-url>
cd naniiicu
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3001
# Health Check: http://localhost:3001/health
```

### Development Setup

```bash
# Frontend
cd naniiicu-app && npm install && npm run dev

# Backend (separate terminal)
cd backend && npm install && npm run dev

# MongoDB (Docker)
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

## API Endpoints

### URL Shortening
- `POST /api/links` - Create short URL
- `POST /api/links/check-availability` - Check name availability
- `GET /api/links/:shortName/stats` - Get statistics
- `GET /:shortName` - Redirect to original URL

### Link Hubs
- `POST /api/hubs` - Create link hub
- `POST /api/hubs/check-availability` - Check hub name availability
- `GET /api/hubs/:hubName` - Get hub details
- `GET /api/hubs/:hubName/stats` - Get hub statistics
- `GET /:hubName` - Display hub page

### Example: Create Short URL
```bash
curl -X POST http://localhost:3001/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "customName": "mylink"}'
```

### Example: Create Link Hub
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

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080
MONGO_URI=mongodb://admin:password@mongodb:27017/naniiicu?authSource=admin
BASE_URL=http://localhost:3001
```

### Frontend
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3001`)

## Technology Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite, qrcode.react
**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
**Infrastructure:** Docker, Docker Compose, Nginx

## Project Structure

```
naniiicu/
├── naniiicu-app/          # React frontend
├── backend/               # Express API
├── mongodb-data/          # MongoDB volume
└── docker-compose.yml     # Container orchestration
```

## Documentation

For detailed development guidance, see [CLAUDE.md](CLAUDE.md)

---

Made with modern web technologies
