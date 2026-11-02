import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const vp of [{w:1200,h:1000},{w:390,h:844}]) {
  const c = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
  const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /Create a free account/i }).click();
  await p.waitForTimeout(400);
  console.log(vp, await p.evaluate(() => ({ scroll: document.querySelector('.app-scroll')?.scrollHeight, client: document.querySelector('.app-scroll')?.clientHeight })));
  if (vp.w===1200) await p.screenshot({ path: 'C:/Users/Kaira/AppData/Local/Temp/opencode/shots/25-register1.png' });
  await c.close();
}
await b.close();
