import apicache from 'apicache';
import { Request, Response } from 'express';

// Setup apicache with custom logic if needed
const cache = apicache.options({
  statusCodes: {
    include: [200], // Only cache successful responses
  },
  headers: {
    'cache-control': 'no-cache', // Keep default header behavior if managed by express
  },
}).middleware;

// Export a configured middleware for standard 5 minute caching
export const cache5Minutes = cache('5 minutes');
export const cache1Hour = cache('1 hour');

// A conditional cache that only caches if there's no active admin session
export const cachePublicOnly = (duration: string) => {
  return cache(duration, (req: Request, res: Response) => {
    // Only cache if there's no auth token (meaning it's a public request)
    return !req.cookies.token;
  });
};
