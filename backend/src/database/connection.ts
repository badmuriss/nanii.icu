import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import { logger } from '../config/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info({ mongoUri: config.mongoUri.replace(/:[^:@]+@/, ':****@') }, 'Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    throw error;
  }
};