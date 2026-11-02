import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'C:/Users/Kaira/AppData/Local/Temp/opencode/campussmart-ad/captures';
fs.mkdirSync(OUT, { recursive: true });

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const context = await browser.newContext({
  viewport: { width: 900, height: 1000 },
  deviceScaleFactor: 3,
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

const base = 'http://127.0.0.1:5173/';
const device = page.locator('#app-device');

async function shot(name) {
  await page.waitForTimeout(1100);
  await device.screenshot({ path: path.join(OUT, name + '.png') });
  console.log('captured', name);
}

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('welcome');

await page.getByRole('button', { name: /already have an account/i }).click();
await page.waitForTimeout(500);
await shot('login');

await page.getByRole('button', { name: /Student buyer/i }).click();
await page.getByRole('button', { name: /^Sign in$/i }).click();
await page.waitForTimeout(1500);
await shot('home');

await page.goto(base + '#/explore', { waitUntil: 'networkidle' });
await shot('explore');

const search = page.getByLabel('Search the marketplace');
if (await search.count()) {
  await search.fill('calculator');
  await page.waitForTimeout(900);
  await shot('explore-search');
}

await page.goto(base + '#/product/l4', { waitUntil: 'networkidle' });
await shot('product');

await page.getByRole('button', { name: /Add to cart/i }).click().catch(() => {});
await page.waitForTimeout(500);
await page.goto(base + '#/explore', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.goto(base + '#/product/l16', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Add to cart/i }).click().catch(() => {});
await page.waitForTimeout(500);
await page.goto(base + '#/cart', { waitUntil: 'networkidle' });
await shot('cart');

await page.goto(base + '#/checkout', { waitUntil: 'networkidle' });
await shot('checkout');

await page.goto(base + '#/orders', { waitUntil: 'networkidle' });
await shot('orders');

await page.goto(base + '#/order/o5', { waitUntil: 'networkidle' });
await shot('order-detail');

await page.goto(base + '#/chat/c1', { waitUntil: 'networkidle' });
await shot('chat');

await page.goto(base + '#/messages', { waitUntil: 'networkidle' });
await shot('messages');

await page.goto(base + '#/seller/u2', { waitUntil: 'networkidle' });
await shot('seller-profile');

await page.goto(base + '#/sell', { waitUntil: 'networkidle' });
await shot('sell');

// Switch to seller for Seller Center
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const s = JSON.parse(raw);
  s.currentUserId = 'u2';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(s));
});
await page.goto(base + '#/seller', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await shot('seller-center');

await page.goto(base + '#/boost/l8', { waitUntil: 'networkidle' });
await shot('boost');

// Admin
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const s = JSON.parse(raw);
  s.currentUserId = 'u9';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(s));
});
await page.goto(base + '#/admin', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await shot('admin');

// Back to buyer for profile
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const s = JSON.parse(raw);
  s.currentUserId = 'u1';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(s));
});
await page.goto(base + '#/profile', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await shot('profile');

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
