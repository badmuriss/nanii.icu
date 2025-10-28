import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { urlRouter } from './routes/urls.js';
import { hubRouter } from './routes/hubs.js';
import { redirectRouter } from './routes/redirect.js';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectDatabase } from './database/connection.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = config.corsOrigin;

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Debug - Request origin:', origin);
    console.log('CORS Debug - Allowed origins:', allowedOrigins);

    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS Debug - Origin allowed:', origin);
      return callback(null, true);
    } else {
      console.log('CORS Debug - Origin NOT allowed:', origin);
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
    console.log('Starting nanii.icu backend server...');
    console.log('Configuration:');
    console.log(`   Port: ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Base URL: ${config.baseUrl}`);
    console.log(`   Allowed Origins: ${JSON.stringify(allowedOrigins)}`);

    await connectDatabase();

    app.listen(config.port, () => {
      console.log('NANII.ICU BACKEND RUNNING');
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();