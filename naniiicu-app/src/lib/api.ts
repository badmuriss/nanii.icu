// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    if (!data.success) {
      throw new ApiError(data.error || 'API request failed', response.status, data);
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// URL Shortener API
export interface ShortenUrlRequest {
  originalUrl: string;
  customName?: string;
}

export interface ShortenUrlResponse {
  id: string;
  shortName: string;
  originalUrl: string;
  customName?: string;
  createdAt: string;
  clickCount: number;
}

export interface CheckAvailabilityRequest {
  customName: string;
}

export interface CheckAvailabilityResponse {
  customName: string;
  available: boolean;
  reason?: string;
}

export interface UrlStatsResponse {
  shortName: string;
  originalUrl: string;
  customName?: string;
  createdAt: string;
  stats: {
    totalClicks: number;
    clicksToday: number;
    clicksThisWeek: number;
    clicksThisMonth: number;
    recentClicks: Array<{
      id: string;
      clickedAt: string;
      userIp?: string;
      referrer?: string;
      country?: string;
    }>;
  };
}

// Hub API interfaces
export interface CreateHubRequest {
  title: string;
  description?: string;
  links: Array<{
    title: string;
    url: string;
    order: number;
  }>;
  customName?: string;
}

export interface CreateHubResponse {
  id: string;
  hubName: string;
  title: string;
  description?: string;
  links: Array<{
    title: string;
    url: string;
    order: number;
  }>;
  customName?: string;
  createdAt: string;
  clickCount: number;
}

// API methods for URLs
export const urlApi = {
  // Create short URL
  createShortUrl: async (data: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
    return makeApiRequest<ShortenUrlResponse>('/api/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Check custom name availability
  checkAvailability: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    return makeApiRequest<CheckAvailabilityResponse>('/api/links/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get URL statistics
  getStats: async (shortName: string): Promise<UrlStatsResponse> => {
    return makeApiRequest<UrlStatsResponse>(`/api/links/${shortName}/stats`);
  },

  // Get all URLs
  getAllUrls: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return makeApiRequest<ShortenUrlResponse[]>(`/api/links${query}`);
  },
};

// API methods for Hubs
export const hubApi = {
  // Create hub
  createHub: async (data: CreateHubRequest): Promise<CreateHubResponse> => {
    return makeApiRequest<CreateHubResponse>('/api/hubs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Check hub name availability
  checkHubAvailability: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    return makeApiRequest<CheckAvailabilityResponse>('/api/hubs/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get hub details
  getHub: async (hubName: string): Promise<CreateHubResponse> => {
    return makeApiRequest<CreateHubResponse>(`/api/hubs/${hubName}`);
  },

  // Get hub statistics
  getHubStats: async (hubName: string) => {
    return makeApiRequest(`/api/hubs/${hubName}/stats`);
  },
};

// Health check (not exported - internal use only)
const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string; database: string }> => {
    return makeApiRequest<{ status: string; timestamp: string; database: string }>('/health');
  },
};