import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

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
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

export { router as healthRouter };