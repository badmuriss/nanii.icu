import dotenv from 'dotenv';

dotenv.config();

/**
 * Build MongoDB connection URI from individual components or use explicit MONGO_URI
 */
const buildMongoUri = (): string => {
  // If MONGO_URI is explicitly set, use it (backward compatibility)
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  // Build from individual components
  const host = process.env.MONGO_HOST || 'localhost';
  const port = process.env.MONGO_PORT || '27017';
  const database = process.env.MONGO_DATABASE || 'naniiicu';
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';

  // Build URI based on whether auth is needed
  if (user && password) {
    return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
  }

  return `mongodb://${host}:${port}/${database}`;
};

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'https://nanii.icu,http://localhost:8080,http://localhost:8082').split(',').map(origin => origin.trim()),
  mongoUri: buildMongoUri(),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
} as const;