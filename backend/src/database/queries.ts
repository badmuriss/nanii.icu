import { nanoid } from 'nanoid';
import { Url, Click, Hub, CreateUrlRequest, CreateClickRequest, CreateHubRequest, UrlStats, HubStats, IUrl, IClick, IHub } from './models.js';
import mongoose from 'mongoose';

// Unified namespace for both URLs and Hubs
export class UnifiedQueries {
  private static instance: UnifiedQueries;

  static getInstance(): UnifiedQueries {
    if (!UnifiedQueries.instance) {
      UnifiedQueries.instance = new UnifiedQueries();
    }
    return UnifiedQueries.instance;
  }

  private generateShortName(): string {
    return nanoid(8);
  }

  private isReservedName(name: string): boolean {
    const reserved = [
      'api', 'admin', 'www', 'app', 'mail', 'ftp', 'root',
      'about', 'contact', 'help', 'support', 'terms', 'privacy',
      'login', 'register', 'signin', 'signup', 'auth', 'oauth',
      'dashboard', 'home', 'index', 'main', 'blog', 'news', 'hub', 'hubs'
    ];
    return reserved.includes(name.toLowerCase());
  }

  async checkNameAvailability(name: string): Promise<{ available: boolean; reason?: string }> {
    if (!name || name.trim().length === 0) {
      return { available: false, reason: 'Name cannot be empty' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      return { available: false, reason: 'Name must be at least 3 characters long' };
    }

    if (trimmedName.length > 50) {
      return { available: false, reason: 'Name must be less than 50 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      return { available: false, reason: 'Name can only contain letters, numbers, hyphens, and underscores' };
    }

    if (this.isReservedName(trimmedName)) {
      return { available: false, reason: 'This name is reserved and cannot be used' };
    }

    // Check both URL and Hub collections for conflicts
    const [existingUrl, existingHub] = await Promise.all([
      Url.findOne({ shortName: trimmedName, isActive: true }),
      Hub.findOne({ hubName: trimmedName, isActive: true })
    ]);

    if (existingUrl || existingHub) {
      return { available: false, reason: 'This name is already taken' };
    }

    return { available: true };
  }

  async generateUniqueShortName(): Promise<string> {
    let attempts = 0;
    let shortName: string;
    let availability: { available: boolean; reason?: string };

    do {
      shortName = this.generateShortName();
      attempts++;
      if (attempts > 10) {
        throw new Error('Unable to generate unique short name');
      }

      availability = await this.checkNameAvailability(shortName);
    } while (!availability.available);

    return shortName;
  }
}

export class UrlQueries {
  private static instance: UrlQueries;
  private unified = UnifiedQueries.getInstance();

  static getInstance(): UrlQueries {
    if (!UrlQueries.instance) {
      UrlQueries.instance = new UrlQueries();
    }
    return UrlQueries.instance;
  }

  async createUrl(request: CreateUrlRequest): Promise<IUrl> {
    let shortName: string;

    if (request.customName) {
      const trimmedCustomName = request.customName.trim();
      const availability = await this.checkCustomNameAvailability(trimmedCustomName);

      if (!availability.available) {
        throw new Error(availability.reason || 'This custom name is not available');
      }

      shortName = trimmedCustomName;
    } else {
      shortName = await this.unified.generateUniqueShortName();
    }

    const urlData = {
      shortName,
      originalUrl: request.originalUrl,
      customName: request.customName || undefined,
      userIp: request.userIp,
      userAgent: request.userAgent,
      expiresAt: request.expiresAt
    };

    const url = new Url(urlData);
    return await url.save();
  }

  async getUrlById(id: string): Promise<IUrl | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Url.findById(id);
  }

  async getUrlByShortName(shortName: string): Promise<IUrl | null> {
    return await Url.findOne({
      shortName,
      isActive: true
    });
  }

  async checkCustomNameAvailability(customName: string): Promise<{ available: boolean; reason?: string }> {
    // Basic validation
    if (!customName || customName.trim().length === 0) {
      return { available: false, reason: 'Name cannot be empty' };
    }

    const trimmedName = customName.trim();

    if (trimmedName.length < 3) {
      return { available: false, reason: 'Name must be at least 3 characters long' };
    }

    if (trimmedName.length > 50) {
      return { available: false, reason: 'Name must be less than 50 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      return { available: false, reason: 'Name can only contain letters, numbers, hyphens, and underscores' };
    }

    // Check reserved names
    const reserved = [
      'api', 'admin', 'www', 'app', 'mail', 'ftp', 'root',
      'about', 'contact', 'help', 'support', 'terms', 'privacy',
      'login', 'register', 'signin', 'signup', 'auth', 'oauth',
      'dashboard', 'home', 'index', 'main', 'blog', 'news', 'hub', 'hubs', 'h'
    ];
    if (reserved.includes(trimmedName.toLowerCase())) {
      return { available: false, reason: 'This name is reserved and cannot be used' };
    }

    // Check only URLs collection for conflicts
    const existingUrl = await Url.findOne({ shortName: trimmedName, isActive: true });

    if (existingUrl) {
      return { available: false, reason: 'This name is already taken' };
    }

    return { available: true };
  }

  async incrementClickCount(urlId: mongoose.Types.ObjectId): Promise<void> {
    await Url.findByIdAndUpdate(
      urlId,
      {
        $inc: { clickCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  async createClick(request: CreateClickRequest): Promise<IClick> {
    const click = new Click(request);
    return await click.save();
  }

  async getUrlStats(urlId: mongoose.Types.ObjectId): Promise<UrlStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClicks,
      clicksToday,
      clicksThisWeek,
      clicksThisMonth,
      recentClicks
    ] = await Promise.all([
      Click.countDocuments({ urlId }),
      Click.countDocuments({ urlId, clickedAt: { $gte: todayStart } }),
      Click.countDocuments({ urlId, clickedAt: { $gte: weekStart } }),
      Click.countDocuments({ urlId, clickedAt: { $gte: monthStart } }),
      Click.find({ urlId })
        .sort({ clickedAt: -1 })
        .limit(10)
    ]);

    return {
      totalClicks,
      clicksToday,
      clicksThisWeek,
      clicksThisMonth,
      recentClicks
    };
  }

  async getAllUrls(limit: number = 100, offset: number = 0): Promise<IUrl[]> {
    return await Url.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .skip(offset);
  }
}

export class HubQueries {
  private static instance: HubQueries;
  private unified = UnifiedQueries.getInstance();

  static getInstance(): HubQueries {
    if (!HubQueries.instance) {
      HubQueries.instance = new HubQueries();
    }
    return HubQueries.instance;
  }

  async createHub(request: CreateHubRequest): Promise<IHub> {
    let hubName: string;

    if (request.customName) {
      const trimmedCustomName = request.customName.trim();
      const availability = await this.checkCustomNameAvailability(trimmedCustomName);

      if (!availability.available) {
        throw new Error(availability.reason || 'This custom name is not available');
      }

      hubName = trimmedCustomName;
    } else {
      hubName = await this.unified.generateUniqueShortName();
    }

    const hubData = {
      hubName,
      title: request.title,
      description: request.description,
      links: request.links.sort((a, b) => a.order - b.order),
      customName: request.customName || undefined,
      userIp: request.userIp,
      userAgent: request.userAgent,
      expiresAt: request.expiresAt
    };

    const hub = new Hub(hubData);
    return await hub.save();
  }

  async getHubById(id: string): Promise<IHub | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Hub.findById(id);
  }

  async getHubByName(hubName: string): Promise<IHub | null> {
    return await Hub.findOne({
      hubName,
      isActive: true
    });
  }

  async checkCustomNameAvailability(customName: string): Promise<{ available: boolean; reason?: string }> {
    // Basic validation
    if (!customName || customName.trim().length === 0) {
      return { available: false, reason: 'Name cannot be empty' };
    }

    const trimmedName = customName.trim();

    if (trimmedName.length < 3) {
      return { available: false, reason: 'Name must be at least 3 characters long' };
    }

    if (trimmedName.length > 50) {
      return { available: false, reason: 'Name must be less than 50 characters' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      return { available: false, reason: 'Name can only contain letters, numbers, hyphens, and underscores' };
    }

    // Check reserved names
    const reserved = [
      'api', 'admin', 'www', 'app', 'mail', 'ftp', 'root',
      'about', 'contact', 'help', 'support', 'terms', 'privacy',
      'login', 'register', 'signin', 'signup', 'auth', 'oauth',
      'dashboard', 'home', 'index', 'main', 'blog', 'news', 'hub', 'hubs', 'h'
    ];
    if (reserved.includes(trimmedName.toLowerCase())) {
      return { available: false, reason: 'This name is reserved and cannot be used' };
    }

    // Check only Hubs collection for conflicts
    const existingHub = await Hub.findOne({ hubName: trimmedName, isActive: true });

    if (existingHub) {
      return { available: false, reason: 'This name is already taken' };
    }

    return { available: true };
  }

  async incrementClickCount(hubId: mongoose.Types.ObjectId): Promise<void> {
    await Hub.findByIdAndUpdate(
      hubId,
      {
        $inc: { clickCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  async getHubStats(hubId: mongoose.Types.ObjectId): Promise<HubStats> {
    const hub = await Hub.findById(hubId);
    if (!hub) {
      throw new Error('Hub not found');
    }

    // For now, return basic stats - can be enhanced with click tracking later
    return {
      totalClicks: hub.clickCount,
      clicksToday: 0, // Would need separate click tracking like URLs
      clicksThisWeek: 0,
      clicksThisMonth: 0,
      linkStats: hub.links.map(link => ({
        title: link.title,
        url: link.url,
        clicks: 0 // Would need separate tracking per link
      }))
    };
  }

  async getAllHubs(limit: number = 100, offset: number = 0): Promise<IHub[]> {
    return await Hub.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .skip(offset);
  }
}