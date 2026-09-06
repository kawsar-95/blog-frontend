import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on("response", r => {
  if (r.url().includes("/api/auth")) console.log("API", r.status(), r.url().slice(0, 80));
});
await page.goto("http://localhost:3017/register", { waitUntil: "domcontentloaded" });
await page.waitForSelector('input', { timeout: 10000 });
await page.waitForTimeout(800);
console.log("input count:", await page.locator('input').count());
console.log("inputs of type email:", await page.locator('input[type="email"]').count());
console.log("inputs of type password:", await page.locator('input[type="password"]').count());

// Test 1: fill all then submit with bad email
await page.locator('input').nth(0).fill("X");
await page.locator('input').nth(1).fill("Y");
await page.locator('input[type="email"]').fill("not-an-email");
await page.locator('input[type="password"]').nth(0).fill("password123");
await page.locator('input[type="password"]').nth(1).fill("password123");

const btn = page.getByRole("button", { name: "Register" });
await btn.click({ force: true });
await page.waitForTimeout(800);
console.log("URL after submit:", page.url());
console.log("error texts:", await page.locator("p.text-red-600").allTextContents());
console.log("'valid email' visible:", (await page.getByText(/valid email/i).count()) > 0);
console.log("'Email' label visible:", (await page.getByText(/email/i).count()) > 0);
await browser.close();
