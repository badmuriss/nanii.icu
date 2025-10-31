import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { logger } from './config/logger.js';
import { urlRouter } from './routes/urls.js';
import { hubRouter } from './routes/hubs.js';
import { redirectRouter } from './routes/redirect.js';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './database/connection.js';

const app = express();

// Trust proxy - needed for rate limiting and getting real client IP behind nginx/traefik
app.set('trust proxy', true);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = config.corsOrigin;

app.use(cors({
  origin: function (origin, callback) {
    logger.debug({ origin, allowedOrigins }, 'CORS request received');

    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      logger.debug({ origin }, 'CORS origin allowed');
      return callback(null, true);
    } else {
      logger.warn({ origin, allowedOrigins }, 'CORS origin blocked');
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

app.use('/health', healthRouter);
app.use('/api/links', urlRouter);
app.use('/api/hubs', hubRouter);
app.use('/', redirectRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    logger.info('Starting nanii.icu backend server...');
    logger.info({
      port: config.port,
      environment: config.nodeEnv,
      allowedOrigins,
    }, 'Server configuration');

    await connectDatabase();

    app.listen(config.port, () => {
      logger.info({ port: config.port }, 'NANII.ICU BACKEND RUNNING');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();