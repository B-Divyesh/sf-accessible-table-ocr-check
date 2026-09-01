'use strict';

// CommonJS is required by the Azure Functions v1 entry-point contract.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createHash } = require('node:crypto');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isIP } = require('node:net');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const PRODUCT = 'accessible-table-ocr-check';
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT}/verify`;
const INSTANCE_ID = createHash('sha256').update(process.env.WEBSITE_INSTANCE_ID || `${process.pid}-${Date.now()}-${Math.random()}`).digest('hex').slice(0, 12);
const REDIS_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`;

let redisPromise;
let storeOverride;

function header(req, name) {
  return req.headers?.[name] || req.headers?.[name.toLowerCase()] || req.headers?.get?.(name) || '';
}

function clientKey(req) {
  const forwarded = header(req, 'x-azure-clientip') || header(req, 'x-forwarded-for');
  const supplied = String(forwarded).split(',')[0].trim();
  let address = supplied || 'unknown-client';
  if (supplied && !isIP(supplied)) {
    const bracketed = supplied.match(/^\[([0-9a-f:]+)\](?::\d+)?$/i);
    const separator = supplied.lastIndexOf(':');
    const withoutPort = separator > 0 ? supplied.slice(0, separator) : '';
    if (bracketed && isIP(bracketed[1])) address = bracketed[1];
    else if (/^\d+$/.test(supplied.slice(separator + 1)) && isIP(withoutPort)) address = withoutPort;
  }
  return createHash('sha256').update(address).digest('base64url').slice(0, 22);
}

function redisSettings() {
  const host = process.env.RATE_LIMIT_REDIS_HOST;
  const password = process.env.RATE_LIMIT_REDIS_KEY;
  return typeof host === 'string' && host.length > 0 && typeof password === 'string' && password.length > 0
    ? { host, password }
    : undefined;
}

async function sharedStore() {
  if (storeOverride) return storeOverride;
  const settings = redisSettings();
  if (!settings) return undefined;
  if (!redisPromise) {
    redisPromise = (async () => {
      // Loaded lazily so unit tests never need a live cache.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('redis');
      const client = createClient({
        password: settings.password,
        socket: {
          host: settings.host,
          port: 6380,
          tls: true,
          connectTimeout: 4_000,
          reconnectStrategy: (retries) => retries > 3 ? false : Math.min(50 * 2 ** retries, 1_000),
        },
      });
      client.on('error', () => {});
      await client.connect();
      return {
        async take(key) {
          const result = await client.eval(REDIS_SCRIPT, {
            keys: [`rate-limit:${PRODUCT}:${key}`],
            arguments: [String(WINDOW_MS)],
          });
          if (!Array.isArray(result) || result.length !== 2) throw new Error('Unexpected rate-limit response.');
          return { count: Number(result[0]), ttlMs: Number(result[1]) };
        },
        close: () => client.close(),
      };
    })().catch((error) => {
      redisPromise = undefined;
      throw error;
    });
  }
  return redisPromise;
}

async function checkLimit(req) {
  const store = await sharedStore();
  if (!store) return { configured: false, allowed: false, count: 0, retryAfter: 60, remaining: 0 };
  const state = await store.take(clientKey(req));
  const retryAfter = Math.max(1, Math.ceil(state.ttlMs / 1_000));
  return {
    configured: true,
    allowed: state.count <= MAX_REQUESTS,
    count: state.count,
    retryAfter,
    remaining: Math.max(0, MAX_REQUESTS - state.count),
  };
}

module.exports = async function licenseVerify(context, req) {
  let limit;
  try {
    limit = await checkLimit(req);
  } catch {
    context.log.error('The shared rate-limit store was unavailable; license verification is closed.');
    limit = { configured: false, allowed: false, count: 0, retryAfter: 60, remaining: 0 };
  }
  const headers = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(limit.remaining),
    'X-RateLimit-Count': String(limit.count),
    'X-RateLimit-Policy': 'atomic-product-window',
    'X-RateLimit-Instance': INSTANCE_ID,
  };
  if (!limit.configured) {
    return { status: 503, headers: { ...headers, 'Retry-After': '60' }, body: { valid: false, reason: 'unavailable', expires_at: null } };
  }
  if (!limit.allowed) {
    return {
      status: 429,
      headers: { ...headers, 'Retry-After': String(limit.retryAfter) },
      body: { valid: false, reason: 'rate_limited', expires_at: null },
    };
  }

  const license = String(req.query?.license ?? '').trim();
  if (!license || license.length > 2_048) {
    return { status: 400, headers, body: { valid: false, reason: 'invalid', expires_at: null } };
  }

  try {
    const upstream = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(license)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
    const body = await upstream.json();
    return { status: upstream.status, headers, body };
  } catch {
    context.log.warn('License verification upstream was unavailable.');
    return { status: 503, headers: { ...headers, 'Retry-After': '60' }, body: { valid: false, reason: 'unavailable', expires_at: null } };
  }
};

module.exports._setRateLimitStoreForTests = (store) => {
  storeOverride = store;
};

module.exports._resetForTests = async () => {
  storeOverride = undefined;
  if (redisPromise) {
    const store = await redisPromise.catch(() => undefined);
    await store?.close?.();
    redisPromise = undefined;
  }
};
