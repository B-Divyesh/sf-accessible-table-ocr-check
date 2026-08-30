const target = process.argv[2] ?? 'https://accessible-table-ocr-check.sociobot.in/api/license/verify?license=qa-invalid-token';
let cookie = '';
const results = [];

for (let requestNumber = 1; requestNumber <= 21; requestNumber += 1) {
  const response = await fetch(target, { headers: cookie ? { Cookie: cookie } : {} });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';', 1)[0];
  results.push({ request: requestNumber, status: response.status, retryAfter: response.headers.get('retry-after'), policy: response.headers.get('x-ratelimit-policy'), instance: response.headers.get('x-ratelimit-instance') });
  await response.arrayBuffer();
}

for (const result of results) console.log(`${result.request}\t${result.status}\t${result.retryAfter ?? '-'}\t${result.policy ?? '-'}`);
console.log(`function instances observed: ${new Set(results.map(({ instance }) => instance).filter(Boolean)).size}`);
const firstTwentyAllowed = results.slice(0, 20).every(({ status }) => status === 200);
const excess = results[20];
if (!firstTwentyAllowed || excess.status !== 429 || !(Number(excess.retryAfter) > 0) || excess.policy !== 'signed-client-window') {
  throw new Error('Live rate-limit regression failed: expected 20 × 200, then 429 with Retry-After and signed-client-window policy.');
}
