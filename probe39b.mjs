import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on("response", r => {
  if (r.url().includes("/api/")) console.log("API", r.status(), r.url().slice(0, 80));
});
await page.goto("http://localhost:3017/register", { waitUntil: "domcontentloaded" });
await page.waitForSelector('input', { timeout: 10000 });
await page.waitForTimeout(800);

await page.locator('input').nth(0).fill("X");
await page.locator('input').nth(1).fill("Y");
await page.locator('input[type="email"]').fill("not-an-email");
await page.locator('input[type="password"]').nth(0).fill("password123");
await page.locator('input[type="password"]').nth(1).fill("password123");

const btn = page.getByRole("button", { name: "Register" });
await btn.click({ force: true });
await page.waitForTimeout(800);

// Check native validation
const emailField = page.locator('input[type="email"]');
const validity = await emailField.evaluate(el => ({
  valid: el.validity.valid,
  msg: el.validationMessage,
  typeMismatch: el.validity.typeMismatch
}));
console.log("email field validity:", validity);
const formValid = await page.evaluate(() => {
  const form = document.querySelector('form');
  return { valid: form.checkValidity(), html: form.outerHTML.slice(0, 300) };
});
console.log("form:", formValid);
await browser.close();
