import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { HubQueries } from '../database/queries.js';

const router = Router();
const hubQueries = HubQueries.getInstance();

const linkSchema = z.object({
  title: z.string().min(1, 'Link title is required').max(100, 'Link title must be less than 100 characters'),
  url: z.string().url('Invalid URL format'),
  order: z.number().int().min(0, 'Order must be a non-negative integer')
});

const createHubSchema = z.object({
  title: z.string().min(1, 'Hub title is required').max(100, 'Hub title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  links: z.array(linkSchema).min(1, 'At least one link is required').max(10, 'Maximum 10 links allowed'),
  customName: z.string().optional().refine(
    (val) => !val || (val.trim().length >= 3 && val.trim().length <= 50),
    'Custom name must be between 3 and 50 characters'
  )
});

const checkAvailabilitySchema = z.object({
  customName: z.string().min(1, 'Custom name is required')
});

// Create hub
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createHubSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { title, description, links, customName } = validation.data;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (customName) {
      const availability = await hubQueries.checkCustomNameAvailability(customName);
      if (!availability.available) {
        return res.status(409).json({
          success: false,
          error: availability.reason || 'Custom name is not available'
        });
      }
    }

    const hubRecord = await hubQueries.createHub({
      title,
      description,
      links,
      customName: customName?.trim(),
      userIp,
      userAgent
    });

    res.status(201).json({
      success: true,
      data: {
        id: hubRecord._id,
        hubName: hubRecord.hubName,
        title: hubRecord.title,
        description: hubRecord.description,
        links: hubRecord.links,
        customName: hubRecord.customName,
        createdAt: hubRecord.createdAt,
        clickCount: hubRecord.clickCount
      }
    });

  } catch (error) {
    console.error('Error creating Hub:', error);

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
      error: 'Failed to create hub'
    });
  }
});

// Check hub name availability
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
    const availability = await hubQueries.checkCustomNameAvailability(customName);

    res.json({
      success: true,
      data: {
        customName: customName.trim(),
        available: availability.available,
        reason: availability.reason
      }
    });

  } catch (error) {
    console.error('Error checking hub availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
});

// Get hub by name
router.get('/:hubName', async (req: Request, res: Response) => {
  try {
    const { hubName } = req.params;
    const hub = await hubQueries.getHubByName(hubName);

    if (!hub) {
      return res.status(404).json({
        success: false,
        error: 'Hub not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: hub._id,
        hubName: hub.hubName,
        title: hub.title,
        description: hub.description,
        links: hub.links,
        customName: hub.customName,
        createdAt: hub.createdAt,
        clickCount: hub.clickCount
      }
    });

  } catch (error) {
    console.error('Error fetching hub:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hub'
    });
  }
});

// Get hub statistics
router.get('/:hubName/stats', async (req: Request, res: Response) => {
  try {
    const { hubName } = req.params;
    const hub = await hubQueries.getHubByName(hubName);

    if (!hub) {
      return res.status(404).json({
        success: false,
        error: 'Hub not found'
      });
    }

    const stats = await hubQueries.getHubStats(hub._id);

    res.json({
      success: true,
      data: {
        hubName: hub.hubName,
        title: hub.title,
        description: hub.description,
        createdAt: hub.createdAt,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching hub stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hub stats'
    });
  }
});

// Get all hubs
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const hubs = await hubQueries.getAllHubs(Math.min(limit, 100), offset);

    res.json({
      success: true,
      data: hubs.map(hub => ({
        id: hub._id,
        hubName: hub.hubName,
        title: hub.title,
        description: hub.description,
        links: hub.links,
        customName: hub.customName,
        clickCount: hub.clickCount,
        createdAt: hub.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching hubs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hubs'
    });
  }
});

export { router as hubRouter };