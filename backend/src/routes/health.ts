import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;

    if (dbState === 1) {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } else {
      throw new Error('Database not connected');
    }
  } catch (error) {
    logger.error({ error, dbState: mongoose.connection.readyState }, 'Health check failed');
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

export { router as healthRouter };