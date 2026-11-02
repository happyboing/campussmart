import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const c = await b.newContext({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2, isMobile: true });
const p = await c.newPage();
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /already have an account/i }).click();
await p.getByRole('button', { name: /Student buyer/i }).click();
await p.getByRole('button', { name: /^Sign in$/i }).click();
await p.waitForURL('**/#/home');
const setUser = async (id) => {
  await p.evaluate((uid) => { const k='campussmart.state.v1'; const s=JSON.parse(localStorage.getItem(k)); s.currentUserId=uid; localStorage.setItem(k, JSON.stringify(s)); }, id);
  await p.reload({ waitUntil: 'networkidle' });
};
await p.goto('http://127.0.0.1:5173/#/notifications', { waitUntil: 'networkidle' });
await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/27-mobile-notifications.png' });
await p.goto('http://127.0.0.1:5173/#/saved', { waitUntil: 'networkidle' });
await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/28-mobile-saved.png' });
// sell step 3
await p.goto('http://127.0.0.1:5173/#/sell', { waitUntil: 'networkidle' });
await p.getByPlaceholder('e.g. Casio FX-991EX Scientific Calculator').fill('Pre-loved Calculus Textbook');
await p.getByPlaceholder(/Include edition, size, inclusions/i).fill('Stewart 8th edition. Some highlights, no torn pages. Free formula reviewer included.');
await p.getByRole('button', { name: /Continue to pricing/i }).click();
await p.getByLabel('Price').fill('420');
await p.getByRole('button', { name: /Continue to photos/i }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/29-mobile-sell3.png' });
// admin mobile
await setUser('u9');
await p.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' });
await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/30-mobile-admin.png' });
await p.getByRole('button', { name: /Reports/i }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/31-mobile-admin-reports.png' });
await b.close();
