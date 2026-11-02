import { chromium } from 'playwright-core';
import assert from 'node:assert';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const step = (name) => console.log('STEP', name);

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /already have an account/i }).click();
await page.getByRole('button', { name: /Student buyer/i }).click();
await page.getByRole('button', { name: /^Sign in$/i }).click();
await page.waitForURL('**/#/home');
step('logged in as buyer');

const setUser = async (id) => {
  await page.evaluate((uid) => {
    const key = 'campussmart.state.v1';
    const state = JSON.parse(localStorage.getItem(key));
    state.currentUserId = uid;
    localStorage.setItem(key, JSON.stringify(state));
  }, id);
  await page.reload({ waitUntil: 'networkidle' });
};

// Place an order as buyer
await page.goto('http://127.0.0.1:5173/#/product/l1', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Add to cart/i }).click();
await page.goto('http://127.0.0.1:5173/#/cart', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Checkout/i }).click();
await page.waitForURL('**/#/checkout');
await page.getByRole('checkbox').check();
await page.getByRole('button', { name: /Place order/i }).click();
await page.waitForURL('**/orders?new=1**');
await page.getByText('Order placed successfully').waitFor();
step('order placed');
const orderUrl = page.url();
const newOrderId = new URLSearchParams(new URL(orderUrl).hash.split('?')[1] ?? '').get('id');
console.log('new order', newOrderId);
assert(newOrderId, 'order id should be present');
const before = await page.evaluate(() => JSON.parse(localStorage.getItem('campussmart.state.v1')).orders.length);

// Seller confirms
await setUser('u2');
await page.goto('http://127.0.0.1:5173/#/orders', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Sales/i }).click();
await page.getByRole('button', { name: /Confirm order/i }).first().click();
await page.waitForTimeout(500);
const sellerToast = await page.getByText(/Order confirmed/i).count();
console.log('seller confirm toast count', sellerToast);
step('seller confirmed order');

// Buyer confirms received and rates
await setUser('u1');
await page.goto(`http://127.0.0.1:5173/#/order/${newOrderId}`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Confirm received/i }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /Rate seller/i }).click();
await page.getByRole('button', { name: /5 stars|5 star/i }).click().catch(() => {});
await page.getByRole('button', { name: /Submit rating/i }).click();
await page.waitForTimeout(600);
await page.getByText(/Thanks! You rated/i).waitFor();
step('buyer completed and rated');

// Sell flow
await page.goto('http://127.0.0.1:5173/#/sell', { waitUntil: 'networkidle' });
await page.getByPlaceholder('e.g. Casio FX-991EX Scientific Calculator').fill('Test Engineering Calculator');
await page.getByPlaceholder(/Include edition, size, inclusions/i).fill('Brand new scientific calculator for engineering students. Complete with cover and manual.');
await page.getByRole('button', { name: /Continue to pricing/i }).click();
await page.getByLabel('Price').fill('999');
await page.getByRole('button', { name: /Continue to photos/i }).click();
await page.getByRole('button', { name: /Publish listing/i }).click();
await page.waitForTimeout(700);
assert(page.url().includes('/#/product/'), 'should land on product');
await page.getByText('Test Engineering Calculator').first().waitFor();
step('listing published');

// Boost flow as seller who owns test listing
const testListingId = page.url().split('/').pop();
await setUser('u1');
await page.goto(`http://127.0.0.1:5173/#/boost/${testListingId}`, { waitUntil: 'networkidle' });
await page.getByRole('checkbox').check();
await page.getByRole('button', { name: /Pay & boost/i }).click();
await page.getByText('Your listing is boosted.').waitFor();
step('boost purchased');

// Admin verification queue
await page.evaluate(() => {
  const key = 'campussmart.state.v1';
  const state = JSON.parse(localStorage.getItem(key));
  state.currentUserId = null;
  state.pendingUserId = 'u-test';
  state.users.push({
    id: 'u-test', name: 'Test Pending User', email: 'test.pending@mcl.edu.ph',
    password: 'CampuSmart123', role: 'student', department: 'College of Business',
    status: 'pending', verified: false, rating: 0, reviewCount: 0,
    joined: new Date().toISOString(), submittedAt: new Date().toISOString(),
    hue: 123, bio: '',
  });
  localStorage.setItem(key, JSON.stringify(state));
});
await page.reload({ waitUntil: 'networkidle' });
await page.goto('http://127.0.0.1:5173/#/login', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Administrator/i }).click();
await page.getByRole('button', { name: /^Sign in$/i }).click();
await page.waitForURL('**/#/home');
await page.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Verifications/i }).click();
await page.getByText('Test Pending User').waitFor();
await page.getByRole('button', { name: /Approve/i }).first().click();
await page.waitForTimeout(500);
await page.getByText(/is now a verified campus member/i).waitFor();
step('admin approved user');

// Admin report resolution
await page.getByRole('button', { name: /Reports/i }).click();
await page.getByRole('button', { name: /Resolve/i }).first().click();
await page.waitForTimeout(400);
await page.getByText(/Report resolved/i).waitFor();
step('report resolved');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await page.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/30-after-flow.png' });
await browser.close();
