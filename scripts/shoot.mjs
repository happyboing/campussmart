import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots';
fs.mkdirSync(OUT, { recursive: true });

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: chrome, headless: true });

const context = await browser.newContext({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

const shot = async (name, fullPage = false) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage });
  console.log('shot', name, page.url());
};

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('01-welcome');

await page.getByRole('button', { name: /already have an account/i }).click();
await page.waitForTimeout(500);
await shot('02-login');

await page.getByRole('button', { name: /Student buyer/i }).click();
await page.getByRole('button', { name: /^Sign in$/i }).click();
await page.waitForTimeout(1200);
await shot('03-home');

await page.goto('http://127.0.0.1:5173/#/explore', { waitUntil: 'networkidle' });
await shot('04-explore');

await page.goto('http://127.0.0.1:5173/#/product/l4', { waitUntil: 'networkidle' });
await shot('05-product');

await page.getByRole('button', { name: /Add to cart/i }).click();
await page.waitForTimeout(400);
await page.goto('http://127.0.0.1:5173/#/cart', { waitUntil: 'networkidle' });
await shot('06-cart');

await page.goto('http://127.0.0.1:5173/#/checkout', { waitUntil: 'networkidle' });
await shot('07-checkout');

await page.goto('http://127.0.0.1:5173/#/orders', { waitUntil: 'networkidle' });
await shot('08-orders');

await page.goto('http://127.0.0.1:5173/#/order/o5', { waitUntil: 'networkidle' });
await shot('09-order-detail');

await page.goto('http://127.0.0.1:5173/#/messages', { waitUntil: 'networkidle' });
await shot('10-messages');

await page.goto('http://127.0.0.1:5173/#/chat/c1', { waitUntil: 'networkidle' });
await shot('11-chat');

await page.goto('http://127.0.0.1:5173/#/profile', { waitUntil: 'networkidle' });
await shot('12-profile');

await page.goto('http://127.0.0.1:5173/#/sell', { waitUntil: 'networkidle' });
await shot('13-sell');

await page.goto('http://127.0.0.1:5173/#/seller', { waitUntil: 'networkidle' });
await shot('14-seller-center');

await page.goto('http://127.0.0.1:5173/#/boost/l8', { waitUntil: 'networkidle' });
await shot('15-boost');

await page.goto('http://127.0.0.1:5173/#/policies/terms', { waitUntil: 'networkidle' });
await shot('16-policy');

await page.goto('http://127.0.0.1:5173/#/seller/u2', { waitUntil: 'networkidle' });
await shot('17-seller-profile');

// Admin view
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const state = JSON.parse(raw);
  state.currentUserId = 'u9';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(state));
});
await page.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await shot('18-admin');
await page.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' });
await shot('18b-admin');

// Pending state
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const state = JSON.parse(raw);
  state.currentUserId = null;
  state.pendingUserId = 'u-new-demo';
  state.users.push({
    id: 'u-new-demo',
    name: 'Maria Santos',
    email: 'maria.santos@mcl.edu.ph',
    password: 'CampuSmart123',
    role: 'student',
    department: 'College of Business',
    status: 'pending',
    verified: false,
    rating: 0,
    reviewCount: 0,
    joined: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    hue: 200,
    bio: '',
  });
  localStorage.setItem('campussmart.state.v1', JSON.stringify(state));
});
await page.goto('http://127.0.0.1:5173/#/pending', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await shot('19-pending');

// Mobile context with buyer state
await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const state = JSON.parse(raw);
  state.currentUserId = 'u1';
  state.pendingUserId = null;
  localStorage.setItem('campussmart.state.v1', JSON.stringify(state));
});
const storage = await context.storageState();
const mobile = await browser.newContext({
  viewport: { width: 430, height: 900 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  storageState: storage,
});
const mpage = await mobile.newPage();
mpage.on('pageerror', (err) => errors.push('MOBILE PAGEERROR: ' + err.message));
await mpage.goto('http://127.0.0.1:5173/#/home', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(900);
await mpage.screenshot({ path: path.join(OUT, '20-mobile-home.png') });
await mpage.goto('http://127.0.0.1:5173/#/product/l16', { waitUntil: 'networkidle' });
await mpage.waitForTimeout(600);
await mpage.screenshot({ path: path.join(OUT, '21-mobile-product.png') });

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
