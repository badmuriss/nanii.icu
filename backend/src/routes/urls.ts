import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UrlQueries } from '../database/queries.js';

const router = Router();
const urlQueries = UrlQueries.getInstance();

const createUrlSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  customName: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 3 && val.trim().length <= 50),
    'Custom name must be between 3 and 50 characters'
  )
});

const checkAvailabilitySchema = z.object({
  customName: z.string().min(1, 'Custom name is required')
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createUrlSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { originalUrl, customName } = validation.data;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (customName) {
      const availability = await urlQueries.checkCustomNameAvailability(customName);
      if (!availability.available) {
        return res.status(409).json({
          success: false,
          error: availability.reason || 'Custom name is not available'
        });
      }
    }

    const urlRecord = await urlQueries.createUrl({
      originalUrl,
      customName: customName?.trim(),
      userIp,
      userAgent
    });

    res.status(201).json({
      success: true,
      data: {
        id: urlRecord._id,
        shortName: urlRecord.shortName,
        originalUrl: urlRecord.originalUrl,
        customName: urlRecord.customName,
        createdAt: urlRecord.createdAt,
        clickCount: urlRecord.clickCount
      }
    });

  } catch (error) {
    console.error('Error creating URL:', error);

    if (error instanceof Error) {
      if (error.message.includes('already taken') || error.message.includes('reserved')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create short URL'
    });
  }
});

router.post('/check-availability', async (req: Request, res: Response) => {
  try {
    const validation = checkAvailabilitySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { customName } = validation.data;
    const availability = await urlQueries.checkCustomNameAvailability(customName);

    res.json({
      success: true,
      data: {
        customName: customName.trim(),
        available: availability.available,
        reason: availability.reason
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
});

router.get('/:shortName/stats', async (req: Request, res: Response) => {
  try {
    const { shortName } = req.params;
    const url = await urlQueries.getUrlByShortName(shortName);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found'
      });
    }

    const stats = await urlQueries.getUrlStats(url._id);

    res.json({
      success: true,
      data: {
        shortName: url.shortName,
        originalUrl: url.originalUrl,
        customName: url.customName,
        createdAt: url.createdAt,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const urls = await urlQueries.getAllUrls(Math.min(limit, 100), offset);

    res.json({
      success: true,
      data: urls.map(url => ({
        id: url._id,
        shortName: url.shortName,
        originalUrl: url.originalUrl,
        customName: url.customName,
        clickCount: url.clickCount,
        createdAt: url.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch URLs'
    });
  }
});

export { router as urlRouter };