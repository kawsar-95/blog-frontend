// Deeper probe — what's covering the link?
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", m => console.log("[browser]", m.type(), m.text()));
await page.goto("http://localhost:3017/");
await page.waitForSelector("article a", { timeout: 5000 });

// Check what's at the link's bounding box center
const info = await page.evaluate(() => {
  const a = document.querySelector("article h3 a");
  const rect = a.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const hit = document.elementFromPoint(cx, cy);
  return {
    href: a.href,
    rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    hitTagName: hit?.tagName,
    hitClass: hit?.className,
    hitText: hit?.textContent?.slice(0,40),
    sameAsAnchor: hit === a,
    aHasListener: !!a.onclick,
  };
});
console.log("Probe result:", JSON.stringify(info, null, 2));

// Try clicking with force and position
const link = page.locator("article h3 a").first();
await link.click({ force: true, position: { x: 5, y: 5 } });
await page.waitForTimeout(2000);
console.log("After force click:", page.url());

await browser.close();