import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'https://nanii.icu,http://localhost:8080,http://localhost:8082').split(',').map(origin => origin.trim()),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/naniiicu',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
} as const;