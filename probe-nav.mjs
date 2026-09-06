// Quick targeted test for the article navigation
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3017/");
await page.waitForLoadState("networkidle");
const anchors = await page.locator("article a").all();
console.log("anchors inside articles:", anchors.length);
for (let i = 0; i < anchors.length; i++) {
  const href = await anchors[i].getAttribute("href");
  const text = await anchors[i].textContent();
  console.log(`  [${i}] href=${href} text="${text?.trim().slice(0,40)}"`);
}
console.log("Clicking first (title link)...");
await anchors[0].click();
await page.waitForLoadState("networkidle");
console.log("URL after title click:", page.url());

console.log("Going back...");
await page.goto("http://localhost:3017/");
await page.waitForLoadState("networkidle");
await page.waitForSelector("article a", { timeout: 5000 });

// Method 1: locator click
const readMore = page.locator("article a", { hasText: "Read More" }).first();
const box = await readMore.boundingBox();
console.log("Read More boundingBox:", box);
await readMore.click();
await page.waitForLoadState("networkidle");
console.log("URL after Read More locator click:", page.url());

await page.goto("http://localhost:3017/");
await page.waitForSelector("article a", { timeout: 5000 });
console.log("Method 2: dispatching click on title link...");
const titleLink = page.locator("article h3 a").first();
await titleLink.dispatchEvent("click");
await page.waitForTimeout(2000);
console.log("URL after title dispatchEvent click:", page.url());

await page.goto("http://localhost:3017/");
await page.waitForSelector("article a", { timeout: 5000 });
console.log("Method 3: page.evaluate click on title link...");
await page.evaluate(() => {
  const a = document.querySelector("article h3 a");
  if (a) a.click();
});
await page.waitForTimeout(2000);
console.log("URL after evaluate click:", page.url());

await browser.close();