import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
type ApiResponse = { status: number; headers: Record<string, string>; body: unknown };
type RateLimitStore = { take: (key: string) => Promise<{ count: number; ttlMs: number }> };
type VerifyLicense = ((context: { log: { warn: () => void; error: () => void } }, request: unknown) => Promise<ApiResponse>) & {
  _setRateLimitStoreForTests: (store: RateLimitStore | undefined) => void;
  _resetForTests: () => Promise<void>;
};

const verifyLicense = require('../api/license-verify/index.cjs') as VerifyLicense;

function atomicStore(): RateLimitStore {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    async take(key) {
      const now = Date.now();
      let window = windows.get(key);
      if (!window || window.resetAt <= now) {
        window = { count: 0, resetAt: now + 60_000 };
        windows.set(key, window);
      }
      window.count += 1;
      const count = window.count;
      await Promise.resolve();
      return { count, ttlMs: window.resetAt - now };
    },
  };
}

const upstreamResponse = () => new Response(JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }), { status: 200 });
const context = () => ({ log: { warn: vi.fn(), error: vi.fn() } });

describe('license verification response policy', () => {
  afterEach(async () => {
    await verifyLicense._resetForTests();
    vi.unstubAllGlobals();
  });

  it('atomically rejects every simultaneous request beyond 20 across function instances @claim:license-rate-limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => upstreamResponse()));
    const modulePath = require.resolve('../api/license-verify/index.cjs');
    const instanceA = verifyLicense;
    delete require.cache[modulePath];
    const instanceB = require(modulePath) as VerifyLicense;
    const shared = atomicStore();
    instanceA._setRateLimitStoreForTests(shared);
    instanceB._setRateLimitStoreForTests(shared);

    const responses = await Promise.all(Array.from({ length: 25 }, (_, index) => {
      const instance = index % 2 === 0 ? instanceA : instanceB;
      return instance(context(), { headers: { 'x-forwarded-for': `203.0.113.42:${40_000 + index}` }, query: { license: 'invalid-test-token' } });
    }));
    const byCount = responses.toSorted((left, right) => Number(left.headers['X-RateLimit-Count']) - Number(right.headers['X-RateLimit-Count']));

    expect(byCount.map((response) => Number(response.headers['X-RateLimit-Count']))).toEqual(Array.from({ length: 25 }, (_, index) => index + 1));
    expect(byCount.slice(0, 20).every((response) => response.status === 200)).toBe(true);
    expect(byCount.slice(20).every((response) => response.status === 429)).toBe(true);
    expect(byCount.slice(20).every((response) => Number(response.headers['Retry-After']) > 0)).toBe(true);
    expect(byCount[20].body).toEqual({ valid: false, reason: 'rate_limited', expires_at: null });

    await instanceB._resetForTests();
  });

  it('keeps the sequential boundary at 20 requests', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => upstreamResponse()));
    verifyLicense._setRateLimitStoreForTests(atomicStore());
    const responses = [];
    for (let index = 0; index < 21; index += 1) {
      responses.push(await verifyLicense(context(), { headers: { 'x-forwarded-for': '203.0.113.43' }, query: { license: 'invalid-test-token' } }));
    }
    expect(responses.slice(0, 20).every((response) => response.status === 200)).toBe(true);
    expect(responses[20].status).toBe(429);
    expect(Number(responses[20].headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('fails closed when the shared atomic limiter is not configured', async () => {
    delete process.env.RATE_LIMIT_REDIS_HOST;
    delete process.env.RATE_LIMIT_REDIS_KEY;
    const response = await verifyLicense(context(), { headers: {}, query: { license: 'token' } });
    expect(response.status).toBe(503);
    expect(response.headers['Retry-After']).toBe('60');
    expect(response.headers['X-RateLimit-Policy']).toBe('atomic-product-window');
  });

  it('fails closed when the shared atomic limiter errors', async () => {
    const log = context();
    verifyLicense._setRateLimitStoreForTests({ take: async () => { throw new Error('cache unavailable'); } });
    const response = await verifyLicense(log, { headers: {}, query: { license: 'token' } });
    expect(response.status).toBe(503);
    expect(log.log.error).toHaveBeenCalledOnce();
  });

  it('does not call the billing service for a missing token', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    verifyLicense._setRateLimitStoreForTests(atomicStore());
    const response = await verifyLicense(context(), { headers: {}, query: {} });
    expect(response.status).toBe(400);
    expect(response.headers['Cache-Control']).toBe('no-store');
    expect(upstream).not.toHaveBeenCalled();
  });
});
