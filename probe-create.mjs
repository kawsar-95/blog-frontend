// Probe create-blog flow
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on("console", m => console.log("[browser]", m.type(), m.text().slice(0, 200)));
page.on("pageerror", e => console.log("[pageerror]", e.message));
page.on("response", async r => {
  if (r.url().includes("/api/blogs/create")) {
    console.log("[api]", r.status(), r.url(), await r.text().then(t => t.slice(0, 200)));
  }
});

await page.goto("http://localhost:3017/login");
await page.waitForTimeout(500);
await page.locator('input[type="email"]').fill("admin@example.com");
await page.locator('input[type="password"]').fill("password123");
await page.getByRole("button", { name: "Login" }).click({ force: true });
await page.waitForTimeout(2000);

await page.goto("http://localhost:3017/dashboard/blogs/create");
await page.waitForSelector('input', { timeout: 5000 });
await page.waitForTimeout(500);
console.log("URL before submit:", page.url());

await page.locator('input').first().fill("Probe Create");
await page.locator('select').first().selectOption("Testing");
await page.locator('textarea').fill("Probe content - should succeed and redirect.");
await page.getByRole("button", { name: /Publish Blog/i }).click({ force: true });
await page.waitForTimeout(3000);
console.log("URL after submit:", page.url());

await browser.close();