import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const verifyLicense = require('../api/license-verify/index.cjs') as ((context: { log: { warn: () => void; error?: () => void } }, request: unknown) => Promise<{ status: number; headers: Record<string, string>; body: unknown }>) & { _resetForTests: () => void };

process.env.RATE_LIMIT_SECRET = 'unit-test-rate-limit-secret-at-least-32-bytes';

describe('license verification response policy', () => {
  afterEach(() => {
    verifyLicense._resetForTests();
    vi.unstubAllGlobals();
  });

  it('returns 429 with Retry-After after a 20-request client burst @claim:license-rate-limit', async () => {
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

  it('carries the signed allowance across isolated function instances', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }), { status: 200 })));
    const modulePath = require.resolve('../api/license-verify/index.cjs');
    const instanceA = require(modulePath) as typeof verifyLicense;
    delete require.cache[modulePath];
    const instanceB = require(modulePath) as typeof verifyLicense;
    instanceA._resetForTests();
    instanceB._resetForTests();
    const context = { log: { warn: vi.fn(), error: vi.fn() } };
    let cookie = '';
    const statuses = [];
    for (let index = 0; index < 21; index++) {
      const instance = index % 2 === 0 ? instanceA : instanceB;
      const response = await instance(context, { headers: { 'x-forwarded-for': '203.0.113.42', cookie }, query: { license: 'invalid-test-token' } });
      statuses.push(response.status);
      cookie = response.headers['Set-Cookie'].split(';', 1)[0];
    }
    expect(statuses.slice(0, 20)).toEqual(Array(20).fill(200));
    expect(statuses[20]).toBe(429);
  });

  it('fails closed when shared limiter signing is not configured', async () => {
    delete process.env.RATE_LIMIT_SECRET;
    const response = await verifyLicense({ log: { warn: vi.fn(), error: vi.fn() } }, { headers: {}, query: { license: 'token' } });
    expect(response.status).toBe(503);
    expect(response.headers['Retry-After']).toBe('60');
    process.env.RATE_LIMIT_SECRET = 'unit-test-rate-limit-secret-at-least-32-bytes';
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
