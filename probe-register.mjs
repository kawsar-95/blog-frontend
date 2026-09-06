// Probe register bad-email behavior
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("console", m => console.log("[browser]", m.type(), m.text()));
page.on("pageerror", e => console.log("[pageerror]", e.message));
await page.goto("http://localhost:3017/register");
await page.waitForLoadState("networkidle");
await page.locator('input').nth(0).fill("X");
await page.locator('input').nth(1).fill("Y");
await page.locator('input[type="email"]').fill("not-an-email");
await page.locator('input[type="password"]').nth(0).fill("password123");
await page.locator('input[type="password"]').nth(1).fill("password123");

// Wait for hydration
await page.waitForTimeout(1500);

const btn = page.getByRole("button", { name: "Register" });
console.log("Button visible:", await btn.isVisible());
console.log("Button enabled:", await btn.isEnabled());

// Test 1: click via Playwright
const [resp] = await Promise.all([
  page.waitForResponse(r => r.url().includes("/api/auth") || r.status() === 400, { timeout: 3000 }).catch(() => null),
  btn.click(),
]);
console.log("Test 1 API response:", resp ? `${resp.status()} ${resp.url()}` : "none");
await page.waitForTimeout(500);
console.log("Test 1 errors:", await page.locator("p.text-red-600").allTextContents());

// Test 2: dispatch submit event directly
await page.evaluate(() => {
  const form = document.querySelector("form");
  if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
});
await page.waitForTimeout(500);
console.log("Test 2 errors after dispatchEvent:", await page.locator("p.text-red-600").allTextContents());
await browser.close();