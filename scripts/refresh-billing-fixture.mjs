import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const slug = 'accessible-table-ocr-check';
const endpoint = `https://api.sociobot.in/api/v1/products/${slug}/checkout`;
const response = await fetch(endpoint, { redirect: 'manual' });
if (response.status !== 303) throw new Error(`Expected checkout redirect, received ${response.status}.`);

const hostedUrl = response.headers.get('location');
if (!hostedUrl) throw new Error('The checkout response did not include a hosted URL.');
const hosted = await fetch(hostedUrl);
if (!hosted.ok) throw new Error(`Hosted checkout returned ${hosted.status}.`);
const body = await hosted.text();
const checkoutData = body.replaceAll('\\"', '"');
const required = [
  'Accessible Table OCR Check',
  '"session_type":"one_time"',
  '"type":"one_time_price"',
  '"price":1200',
  '"currency":"USD"',
  'order-related inquiries and returns',
];
for (const value of required) if (!checkoutData.includes(value)) throw new Error(`Hosted checkout did not contain ${value}.`);

const fixture = {
  fixture_version: 1,
  captured_at: new Date().toISOString(),
  source: {
    checkout_endpoint: endpoint,
    checkout_endpoint_status: response.status,
    hosted_checkout_host: new URL(hostedUrl).host,
    hosted_checkout_status: hosted.status,
    hosted_checkout_html_sha256: createHash('sha256').update(body).digest('hex'),
    capture_method: 'GET the registered checkout endpoint without an order, follow its 303 redirect, and record the public hosted-checkout session fields below.',
  },
  checkout_session: {
    business_name: 'Sociobot',
    payment_processor_name: 'Dodo Payments',
    product_slug: slug,
    product_name: 'Accessible Table OCR Check',
    session_type: 'one_time',
    price: { type: 'one_time_price', currency: 'USD', amount_minor: 1200, tax_inclusive: true },
    hosted_copy: {
      product_description: 'One-time unlock for Accessible Table OCR Check (accessible-table-ocr-check). Delivered instantly as a license for the product page.',
      order_help: 'This order process is conducted by our online reseller & Merchant of Record, dodopayments.com, who also handles order-related inquiries and returns.',
    },
  },
};

await mkdir('tests/fixtures', { recursive: true });
await writeFile('tests/fixtures/billing-checkout-contract.json', `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Recorded public checkout contract from ${new URL(hostedUrl).host}.`);
