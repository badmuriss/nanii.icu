import { Router, Request, Response } from 'express';
import { UrlQueries, HubQueries } from '../database/queries.js';
import { logger } from '../config/logger.js';

const router = Router();
const urlQueries = UrlQueries.getInstance();
const hubQueries = HubQueries.getInstance();

router.get('/:shortName', async (req: Request, res: Response) => {
  try {
    const { shortName } = req.params;

    // First, try to find a URL
    const url = await urlQueries.getUrlByShortName(shortName);

    if (url) {
      // Handle URL redirect
      if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
        return res.status(410).json({
          success: false,
          error: 'URL has expired'
        });
      }

      const userIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');

      try {
        await urlQueries.createClick({
          urlId: url._id,
          userIp,
          userAgent,
          referrer
        });

        await urlQueries.incrementClickCount(url._id);
      } catch (clickError) {
        logger.warn({ error: clickError, urlId: url._id }, 'Error recording click (non-fatal)');
      }

      return res.redirect(302, url.originalUrl);
    }

    // URL not found, redirect to frontend 404 page
    return res.redirect('/404/not-found');

  } catch (error) {
    logger.error({ error, shortName: req.params.shortName }, 'Error processing redirect');
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Handle hub route /h/:hubShortName
router.get('/h/:hubShortName', async (req: Request, res: Response) => {
  try {
    const { hubShortName } = req.params;

    const hub = await hubQueries.getHubByName(hubShortName);

    if (!hub) {
      return res.status(404).json({
        success: false,
        error: 'Hub not found'
      });
    }

    // Handle Hub expiration
    if (hub.expiresAt && new Date(hub.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Hub has expired'
      });
    }

    try {
      await hubQueries.incrementClickCount(hub._id);
    } catch (clickError) {
      logger.warn({ error: clickError, hubId: hub._id }, 'Error recording hub click (non-fatal)');
    }

    // Return hub data for frontend rendering
    const sortedLinks = hub.links.sort((a, b) => a.order - b.order);

    return res.json({
      success: true,
      type: 'hub',
      data: {
        hubName: hub.hubName,
        title: hub.title,
        description: hub.description,
        links: sortedLinks,
        createdAt: hub.createdAt,
        clickCount: hub.clickCount
      }
    });

  } catch (error) {
    logger.error({ error, hubShortName: req.params.hubShortName }, 'Error processing hub');
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as redirectRouter };