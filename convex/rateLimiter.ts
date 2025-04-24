import { RateLimiter } from '@convex-dev/rate-limiter';
import { components } from './_generated/api';

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  likePost: { kind: 'token bucket', rate: 2, period: 5000 },
});
