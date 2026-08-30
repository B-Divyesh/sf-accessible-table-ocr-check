'use strict';

// CommonJS is required by the Azure Functions v1 entry-point contract.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createHash, createHmac, timingSafeEqual } = require('node:crypto');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const PRODUCT = 'accessible-table-ocr-check';
const VERIFY_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT}/verify`;
const COOKIE_NAME = '__Host-atoc_rate';
const windows = new Map();
const INSTANCE_ID = createHash('sha256').update(process.env.WEBSITE_INSTANCE_ID || `${process.pid}-${Date.now()}-${Math.random()}`).digest('hex').slice(0, 12);

function header(req, name) {
  return req.headers?.[name] || req.headers?.[name.toLowerCase()] || req.headers?.get?.(name) || '';
}

function clientKey(req) {
  const forwarded = header(req, 'x-forwarded-for');
  const address = String(forwarded).split(',')[0].trim() || 'unknown-client';
  return createHash('sha256').update(address).digest('base64url').slice(0, 22);
}

function signingSecret() {
  const value = process.env.RATE_LIMIT_SECRET;
  return typeof value === 'string' && value.length >= 32 ? value : '';
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function readState(req, key, secret, now) {
  const cookie = String(header(req, 'cookie')).split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return undefined;
  const token = cookie.slice(COOKIE_NAME.length + 1);
  const separator = token.lastIndexOf('.');
  if (separator < 1) return undefined;
  const payload = token.slice(0, separator);
  const supplied = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(sign(payload, secret));
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return undefined;
  try {
    const state = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (state.v !== 1 || state.k !== key || !Number.isInteger(state.c) || !Number.isInteger(state.r)) return undefined;
    if (state.c < 0 || state.r <= now || state.r > now + WINDOW_MS) return undefined;
    return { count: state.c, resetAt: state.r };
  } catch {
    return undefined;
  }
}

function writeState(key, state, secret) {
  const payload = Buffer.from(JSON.stringify({ v: 1, k: key, c: state.count, r: state.resetAt })).toString('base64url');
  const token = `${payload}.${sign(payload, secret)}`;
  const maxAge = Math.max(1, Math.ceil((state.resetAt - Date.now()) / 1_000));
  return `${COOKIE_NAME}=${token}; Max-Age=${maxAge}; Path=/; Secure; HttpOnly; SameSite=Strict`;
}

function checkLimit(req, now = Date.now()) {
  const secret = signingSecret();
  if (!secret) return { configured: false, allowed: false, retryAfter: 60 };
  const key = clientKey(req);
  if (windows.size > 2_000) {
    for (const [candidate, value] of windows) if (value.resetAt <= now) windows.delete(candidate);
  }
  const carried = readState(req, key, secret, now);
  let local = windows.get(key);
  if (!local || local.resetAt <= now) local = undefined;
  const resetAt = carried?.resetAt ?? local?.resetAt ?? now + WINDOW_MS;
  const count = Math.max(carried?.count ?? 0, local?.count ?? 0) + 1;
  const state = { count, resetAt };
  windows.set(key, state);
  return {
    configured: true,
    allowed: count <= MAX_REQUESTS,
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1_000)),
    remaining: Math.max(0, MAX_REQUESTS - count),
    cookie: writeState(key, state, secret),
  };
}

module.exports = async function licenseVerify(context, req) {
  const limit = checkLimit(req);
  const headers = {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(limit.remaining ?? 0),
    'X-RateLimit-Policy': 'signed-client-window',
    'X-RateLimit-Instance': INSTANCE_ID,
    ...(limit.cookie ? { 'Set-Cookie': limit.cookie } : {}),
  };
  if (!limit.configured) {
    context.log.error('RATE_LIMIT_SECRET is missing or too short; license verification is closed.');
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

module.exports._resetForTests = () => windows.clear();
