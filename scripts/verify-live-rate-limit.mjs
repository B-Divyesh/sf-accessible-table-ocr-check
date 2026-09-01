const mode = process.argv.includes('--sequential') ? 'sequential' : 'concurrent';
const target = process.argv.find((argument) => argument.startsWith('https://'))
  ?? 'https://accessible-table-ocr-check.sociobot.in/api/license/verify?license=qa-invalid-token';

async function request(requestNumber) {
  const response = await fetch(target, { headers: { 'Cache-Control': 'no-cache' } });
  await response.arrayBuffer();
  return {
    request: requestNumber,
    status: response.status,
    retryAfter: response.headers.get('retry-after'),
    count: Number(response.headers.get('x-ratelimit-count')),
    remaining: response.headers.get('x-ratelimit-remaining'),
    policy: response.headers.get('x-ratelimit-policy'),
    instance: response.headers.get('x-ratelimit-instance'),
  };
}

const results = mode === 'concurrent'
  ? await Promise.all(Array.from({ length: 25 }, (_, index) => request(index + 1)))
  : await (async () => {
      const sequential = [];
      for (let requestNumber = 1; requestNumber <= 21; requestNumber += 1) sequential.push(await request(requestNumber));
      return sequential;
    })();

for (const result of results) {
  console.log(`${result.request}\t${result.count}\t${result.status}\t${result.retryAfter ?? '-'}\t${result.remaining ?? '-'}\t${result.policy ?? '-'}\t${result.instance ?? '-'}`);
}
console.log(`function instances observed: ${new Set(results.map(({ instance }) => instance).filter(Boolean)).size}`);

const byCount = results.toSorted((left, right) => left.count - right.count);
const expectedLength = mode === 'concurrent' ? 25 : 21;
const countsAreContiguous = byCount.every(({ count }, index) => count === index + 1);
const allowedAreCorrect = byCount.slice(0, 20).every(({ status }) => status === 200);
const excessAreCorrect = byCount.slice(20).every(({ status, retryAfter }) => status === 429 && Number(retryAfter) > 0);
const policyIsCorrect = results.every(({ policy }) => policy === 'atomic-product-window');

if (results.length !== expectedLength || !countsAreContiguous || !allowedAreCorrect || !excessAreCorrect || !policyIsCorrect) {
  throw new Error(`Live ${mode} rate-limit regression failed: expected counts 1–${expectedLength}, counts 1–20 as 200, and every excess count as 429 with positive Retry-After.`);
}
