import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const verifyLicense = require('../api/license-verify/index.cjs') as ((context: { log: { warn: () => void } }, request: unknown) => Promise<{ status: number; headers: Record<string, string>; body: unknown }>) & { _resetForTests: () => void };

describe('license verification response policy', () => {
  afterEach(() => {
    verifyLicense._resetForTests();
    vi.unstubAllGlobals();
  });

  it('returns 429 with Retry-After after a 20-request client burst', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }), { status: 200 })));
    const context = { log: { warn: vi.fn() } };
    const request = { headers: { 'x-forwarded-for': '203.0.113.42' }, query: { license: 'invalid-test-token' } };
    const responses = [];
    for (let index = 0; index < 21; index++) responses.push(await verifyLicense(context, request));
    expect(responses.slice(0, 20).every((response) => response.status === 200)).toBe(true);
    expect(responses[20].status).toBe(429);
    expect(Number(responses[20].headers['Retry-After'])).toBeGreaterThan(0);
    expect(responses[20].body).toEqual({ valid: false, reason: 'rate_limited', expires_at: null });
  });

  it('does not call the billing service for a missing token', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await verifyLicense({ log: { warn: vi.fn() } }, { headers: {}, query: {} });
    expect(response.status).toBe(400);
    expect(response.headers['Cache-Control']).toBe('no-store');
    expect(upstream).not.toHaveBeenCalled();
  });
});
