import { chromium } from 'playwright-core';
import assert from 'node:assert';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const step = (n) => console.log('STEP', n);

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Create a free account/i }).click();
await page.waitForURL('**/#/register');
await page.getByLabel('Full name').fill('Maria Santos');
await page.getByLabel('Institutional email').fill('maria.santos@mcl.edu.ph');
await page.getByLabel('Password', { exact: true }).fill('CampuSmart123');
await page.getByLabel('Confirm password').fill('CampuSmart123');
await page.getByRole('button', { name: /Continue/i }).click();
await page.waitForTimeout(300);
assert(await page.getByText('Verify your campus.').count(), 'step 2 visible');
const checks = page.getByRole('checkbox');
await checks.nth(0).check();
await checks.nth(1).check();
await page.getByRole('button', { name: /Submit for verification/i }).click();
await page.waitForURL('**/#/pending');
await page.getByText('We\'re reviewing your account.').waitFor();
step('registration pending');

await page.getByRole('button', { name: /Simulate admin approval/i }).click();
await page.waitForURL('**/#/home');
await page.getByText(/Maria, your campus is open/i).waitFor();
step('demo approval logs in');

// Sign out and Face ID login
await page.goto('http://127.0.0.1:5173/#/profile', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Sign out/i }).click();
await page.getByRole('button', { name: /Sign in with Face ID/i }).waitFor();
await page.getByRole('button', { name: /Sign in with Face ID/i }).click();
await page.waitForTimeout(3300);
await page.waitForURL('**/#/home');
step('face id login');

// Search and filters
await page.goto('http://127.0.0.1:5173/#/explore', { waitUntil: 'networkidle' });
await page.getByLabel('Search listings').fill('calculator');
await page.waitForTimeout(400);
const resultCount = (await page.locator('.result-bar .count').textContent()) ?? '';
assert(resultCount.includes('1 item'), `search count should be 1, got ${resultCount}`);
step('search works');
await page.getByLabel('Search listings').fill('');
await page.getByRole('button', { name: /Filters/i }).click();
await page.getByRole('button', { name: 'For rent', exact: true }).click();
await page.getByRole('button', { name: /Show \d+ results/i }).click();
await page.waitForTimeout(400);
const rentTags = await page.getByText('For rent', { exact: true }).count();
assert(rentTags >= 3, 'rent filter returns items');
step('filters work');

// Chat send
await page.goto('http://127.0.0.1:5173/#/chat/c1', { waitUntil: 'networkidle' });
await page.getByRole('textbox', { name: 'Message' }).fill('Salamat! See you at the library.');
await page.getByRole('button', { name: /Send message/i }).click();
await page.getByText('Salamat! See you at the library.').waitFor();
step('chat send works');

// Report a listing
await page.goto('http://127.0.0.1:5173/#/product/l2', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Report this listing/i }).click();
await page.getByLabel('Details').fill('This is a test report with enough detail.');
await page.getByRole('button', { name: /Submit report/i }).click();
await page.getByText(/Report submitted/i).waitFor();
step('report works');

// Admin guard
await page.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' });
await page.waitForURL('**/#/home');
step('admin route guarded');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
