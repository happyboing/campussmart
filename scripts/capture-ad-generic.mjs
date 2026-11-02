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
const base = 'http://127.0.0.1:5173/';
const device = page.locator('#app-device');

const REPLACE = [
  ['Justin Carl Libo-on', 'Justin L.'],
  ['Kaira', 'Jamie'],
  ['Hi Jamie!', 'Hi!'],
  ['Ate Rina', 'Rina'],
];

async function scrub() {
  await page.evaluate((pairs) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      let value = node.nodeValue;
      for (const [from, to] of pairs) value = value.split(from).join(to);
      if (value !== node.nodeValue) node.nodeValue = value;
    }
    const h1 = document.querySelector('.home-greeting h1');
    if (h1) {
      h1.innerHTML = 'Your campus is <span style="color: var(--navy-500)">open.</span>';
    }
  }, REPLACE);
}

async function shot(name) {
  await page.waitForTimeout(900);
  await scrub();
  await page.waitForTimeout(150);
  await device.screenshot({ path: path.join(OUT, name + '.png') });
  console.log('captured', name);
}

await page.goto(base, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /already have an account/i }).click();
await page.getByRole('button', { name: /Student buyer/i }).click();
await page.getByRole('button', { name: /^Sign in$/i }).click();
await page.waitForTimeout(1400);

await page.goto(base + '#/home', { waitUntil: 'networkidle' });
await shot('home-generic');

await page.goto(base + '#/explore?q=calculator', { waitUntil: 'networkidle' });
await shot('explore-search');

await page.goto(base + '#/product/l4', { waitUntil: 'networkidle' });
await shot('product-generic');

await page.goto(base + '#/chat/c1', { waitUntil: 'networkidle' });
await shot('chat-generic');

await page.goto(base + '#/orders', { waitUntil: 'networkidle' });
await shot('orders-generic');

await page.goto(base + '#/sell', { waitUntil: 'networkidle' });
await shot('sell-generic');

await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const s = JSON.parse(raw);
  s.currentUserId = 'u2';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(s));
});
await page.goto(base + '#/seller', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('seller-center-generic');

await page.evaluate(() => {
  const raw = localStorage.getItem('campussmart.state.v1');
  const s = JSON.parse(raw);
  s.currentUserId = 'u9';
  localStorage.setItem('campussmart.state.v1', JSON.stringify(s));
});
await page.goto(base + '#/admin', { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('admin-generic');

await browser.close();
