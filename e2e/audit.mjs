// /tmp/scenarios.mjs — Full Playwright scenario audit for blog-frontend.
// Logs every page error, console error, network failure, and assertion failure.

import { chromium } from "playwright";
import { writeFileSync } from "fs";

const FRONT = "http://localhost:3001";
const API = "http://localhost:3000";
const OUT = "/tmp/audit";
import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });

const issues = [];
const ok = [];

function record(kind, msg, ctx = {}) {
  issues.push({ kind, msg, ...ctx, ts: new Date().toISOString() });
  console.log(`❌ [${kind}] ${msg}`, ctx.url || "");
}
function pass(msg, ctx = {}) {
  ok.push({ msg, ...ctx });
  console.log(`✅ ${msg}`);
}

async function attachLoggers(page, label) {
  page.on("pageerror", (e) => record("pageerror", e.message, { label }));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Filter expected errors from negative-path scenarios.
    if (/status of 401/i.test(text)) return;        // bad-login test
    if (/status of 400/i.test(text)) return;        // bad-email / bad-register tests
    record("console.error", text, { label });
  });
  page.on("requestfailed", (req) => {
    const u = req.url();
    if (u.startsWith("chrome-extension")) return;
    // Ignore RSC prefetch cancellations — they're harmless and noisy.
    if (u.includes("_rsc=")) return;
    record("requestfailed", `${req.method()} ${u}: ${req.failure()?.errorText}`, { label });
  });
  page.on("response", (res) => {
    if (res.status() >= 500)
      record("5xx", `${res.status()} ${res.url()}`, { label });
  });
}

/**
 * Click that bypasses Next.js dev-mode hydration races.
 * Use for any form submit / Link navigation during the audit.
 */
async function click(page, locator, label) {
  try {
    await locator.click({ force: true, timeout: 5000 });
  } catch (e) {
    record("click-failed", `${label}: ${e.message?.slice(0, 100)}`);
  }
}

async function newPage(browser, label) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await attachLoggers(page, label);
  return { ctx, page };
}

const browser = await chromium.launch({ headless: true });
console.log("=== Scenario Audit Start ===\n");

// ------------------------------------------------------------------
// Scenario 1: Guest browses homepage
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "1-homepage-guest");
  try {
    await page.goto(`${FRONT}/`, { waitUntil: "networkidle" });
    const hasHero = await page.locator("text=Discover").count() > 0;
    if (!hasHero) record("missing", "homepage hero copy missing");
    const blogCards = await page.locator("article").count();
    pass(`homepage rendered, ${blogCards} blog cards visible`);
  } catch (e) { record("scenario", "homepage failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 2: Guest uses search box
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "2-search");
  try {
    await page.goto(`${FRONT}/`, { waitUntil: "networkidle" });
    await page.locator('input[aria-label="Search blogs"]').first().fill("playwright");
    await page.waitForTimeout(800); // debounce
    const cards = await page.locator("article").count();
    pass(`search "playwright" returned ${cards} cards`);
    if (cards !== 1) record("search-result", `expected 1 card for "playwright", got ${cards}`);
  } catch (e) { record("scenario", "search failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 3: Guest filters by category
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "3-filter");
  try {
    await page.goto(`${FRONT}/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Automation" }).click();
    await page.waitForTimeout(600);
    const cards = await page.locator("article").count();
    pass(`category "Automation" returned ${cards} cards`);
  } catch (e) { record("scenario", "filter failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 4: Guest clicks a blog
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "4-blog-details");
  try {
    await page.goto(`${FRONT}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("article a", { timeout: 5000 });
    await page.waitForTimeout(500); // let hydration finish
    await page.locator("article h3 a").first().click({ force: true });
    try {
      await page.waitForURL(/\/blogs\/\d+/, { timeout: 5000 });
    } catch {}
    const url = page.url();
    if (!/\/blogs\/\d+/.test(url)) record("nav", `unexpected URL after click: ${url}`);
    const hasTitle = await page.locator("h1").count() > 0;
    if (!hasTitle) record("missing", "blog details has no h1");
    pass(`blog details opened at ${url}`);
  } catch (e) { record("scenario", "blog details failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 5: Protected route → redirect to /login (guest)
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "5-protected-redirect");
  try {
    await page.goto(`${FRONT}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const url = page.url();
    if (!url.endsWith("/login")) record("guard", `/dashboard should redirect to /login, got ${url}`);
    else pass("guest hitting /dashboard redirected to /login");
  } catch (e) { record("scenario", "redirect failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 6: Registration with empty fields shows validation
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "6-register-validation");
  try {
    await page.goto(`${FRONT}/register`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Register" }).click();
    await page.waitForTimeout(300);
    const errs = await page.locator("p.text-red-600").count();
    if (errs < 3) record("validation", `register validation weak: only ${errs} errors shown`);
    else pass(`register validation shows ${errs} errors`);
  } catch (e) { record("scenario", "register validation failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 7: Registration with bad email
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "7-register-bad-email");
  try {
    await page.goto(`${FRONT}/register`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500); // hydration
    await page.locator('input').nth(0).fill("X");  // firstName
    await page.locator('input').nth(1).fill("Y");  // lastName
    await page.locator('input[type="email"]').fill("not-an-email");
    await page.locator('input[type="password"]').nth(0).fill("password123");
    await page.locator('input[type="password"]').nth(1).fill("password123");
    await page.getByRole("button", { name: "Register" }).click({ force: true });
    await page.waitForTimeout(800);
    const err = await page.locator("text=valid email").count();
    if (!err) record("validation", "bad email accepted");
    else pass("bad email rejected");
  } catch (e) { record("scenario", "bad-email failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 8: Register a fresh user
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "8-register-new");
  const email = `e2e-${Date.now()}@example.com`;
  try {
    await page.goto(`${FRONT}/register`, { waitUntil: "networkidle" });
    await page.locator('input').nth(0).fill("E2E");            // firstName
    await page.locator('input').nth(1).fill("Tester");         // lastName
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').nth(0).fill("password123");
    await page.locator('input[type="password"]').nth(1).fill("password123");
    await page.getByRole("button", { name: "Register" }).click({ force: true });
    await page.waitForTimeout(1500);
    const url = page.url();
    if (!url.endsWith("/login")) record("register", `expected /login, got ${url}`);
    else pass(`registered ${email}, redirected to /login`);
  } catch (e) { record("scenario", "register failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 9: Login with bad password
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "9-login-bad");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("wrong");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(1500);
    const err = await page.locator("text=/Invalid|incorrect|wrong/i").count();
    if (!err) record("login", "bad password gave no error message");
    else pass("bad password surfaces error");
  } catch (e) { record("scenario", "bad-login failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 10: Login as admin
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "10-login-admin");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    const url = page.url();
    if (!url.includes("/dashboard")) record("login", `expected /dashboard, got ${url}`);
    else pass("admin login → dashboard");
  } catch (e) { record("scenario", "login failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 11: Dashboard renders with stats + recent blogs
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "11-dashboard-render");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    const welcome = await page.locator("text=/Welcome/i").count();
    if (!welcome) record("dashboard", "Welcome message missing");
    else pass("dashboard welcome visible");
    const stats = await page.locator("text=Total Blogs").count();
    if (!stats) record("dashboard", "Total Blogs stat missing");
    else pass("dashboard stats visible");
  } catch (e) { record("scenario", "dashboard failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 12: Create blog form works end-to-end
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "12-create-blog");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.goto(`${FRONT}/dashboard/blogs/create`, { waitUntil: "networkidle" });
    await page.waitForSelector('input', { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.locator('input').first().fill("E2E Test Blog");
    await page.locator('select').first().selectOption("Testing");
    await page.locator("textarea").fill("This blog was created by the Playwright audit runner to verify the create flow end-to-end.");
    const [resp] = await Promise.all([
      page.waitForResponse(r => r.url().includes("/api/blogs/create"), { timeout: 8000 }).catch(() => null),
      page.getByRole("button", { name: /Publish Blog/i }).click({ force: true }),
    ]);
    if (resp) console.log(`  [create] API: ${resp.status()} ${resp.url()}`);
    try {
      await page.waitForURL(/\/blogs\/\d+|\/dashboard\/blogs/, { timeout: 8000 });
    } catch {}
    const url = page.url();
    if (!/\/blogs\/\d+/.test(url) && !url.endsWith("/dashboard/blogs"))
      record("create", `unexpected URL after publish: ${url}`);
    else pass(`create blog → ${url}`);
  } catch (e) { record("scenario", "create failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 13: Forgot password page reachable + submits
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "13-forgot");
  try {
    await page.goto(`${FRONT}/forgot-password`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.getByRole("button", { name: /Send Reset/i }).click();
    await page.waitForTimeout(1500);
    const succ = await page.locator("text=/reset link sent/i").count();
    pass(`forgot-password submitted (success banner: ${succ})`);
  } catch (e) { record("scenario", "forgot failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 14: Reset password with bad token
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "14-reset-bad");
  try {
    await page.goto(`${FRONT}/reset-password/invalid-token-xyz`, { waitUntil: "networkidle" });
    await page.locator('input[type="password"]').nth(0).fill("newpassword123");
    await page.locator('input[type="password"]').nth(1).fill("newpassword123");
    await page.getByRole("button", { name: /Reset Password/i }).click({ force: true });
    await page.waitForTimeout(1500);
    const err = await page.locator("text=/Invalid|expired/i").count();
    if (!err) record("reset-bad", "invalid token gave no error");
    else pass("invalid token surfaces error");
  } catch (e) { record("scenario", "reset failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 14b: Full forgot → reset → login flow
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "14b-forgot-reset-flow");
  try {
    // 1. request reset
    await page.goto(`${FRONT}/forgot-password`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    const [r1] = await Promise.all([
      page.waitForResponse(r => r.url().includes("/api/auth/forgot-password"), { timeout: 5000 }),
      page.getByRole("button", { name: /Send Reset/i }).click({ force: true }),
    ]);
    const body = await r1.json();
    const token = body.token;
    if (!token) record("forgot-flow", "no token in forgot-password response");
    else {
      pass(`forgot-password issued token (${token.slice(0,8)}...)`);
      // 2. visit reset URL
      await page.goto(`${FRONT}/reset-password/${token}`, { waitUntil: "networkidle" });
      await page.locator('input[type="password"]').nth(0).fill("newpass123");
      await page.locator('input[type="password"]').nth(1).fill("newpass123");
      const [r2] = await Promise.all([
        page.waitForResponse(r => r.url().includes("/api/auth/reset-password"), { timeout: 5000 }),
        page.getByRole("button", { name: /Reset Password/i }).click({ force: true }),
      ]);
      if (r2.status() === 200) pass("reset-password returned 200");
      else record("reset-flow", `reset-password returned ${r2.status()}`);
      // 3. login with new password
      await page.waitForTimeout(800);
      await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
      await page.locator('input[type="email"]').fill("admin@example.com");
      await page.locator('input[type="password"]').fill("newpass123");
      const [r3] = await Promise.all([
        page.waitForResponse(r => r.url().includes("/api/auth/login"), { timeout: 5000 }),
        page.getByRole("button", { name: "Login" }).click({ force: true }),
      ]);
      if (r3.status() === 200) pass("login with new password works");
      else record("reset-flow", `login after reset returned ${r3.status()}`);
      // Restore the admin password
      await page.goto(`${FRONT}/forgot-password`, { waitUntil: "networkidle" });
      await page.locator('input[type="email"]').fill("admin@example.com");
      const [r4] = await Promise.all([
        page.waitForResponse(r => r.url().includes("/api/auth/forgot-password"), { timeout: 5000 }),
        page.getByRole("button", { name: /Send Reset/i }).click({ force: true }),
      ]);
      const b4 = await r4.json();
      if (b4.token) {
        await page.goto(`${FRONT}/reset-password/${b4.token}`, { waitUntil: "networkidle" });
        await page.locator('input[type="password"]').nth(0).fill("password123");
        await page.locator('input[type="password"]').nth(1).fill("password123");
        await page.getByRole("button", { name: /Reset Password/i }).click({ force: true });
      }
    }
  } catch (e) { record("scenario", "forgot-reset flow failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 15: Edit blog — load existing values, update
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "15-edit-blog");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");
    // Find a blog to edit via API
    const resp = await page.request.get(`${API}/api/blogs`);
    const data = await resp.json();
    const first = data.blogs?.[0];
    if (!first) { record("edit", "no blogs to edit"); }
    else {
      await page.goto(`${FRONT}/dashboard/blogs/${first.id}/edit`, { waitUntil: "networkidle" });
      const titleVal = await page.locator('input').first().inputValue();
      if (!titleVal) record("edit", "edit form not pre-filled");
      else pass(`edit form pre-filled with "${titleVal}"`);
    }
  } catch (e) { record("scenario", "edit failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 16: Delete blog — confirm dialog → table refreshes
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "16-delete");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    try { await page.waitForURL(/\/dashboard/, { timeout: 5000 }); } catch {}
    await page.waitForTimeout(500);
    await page.goto(`${FRONT}/dashboard/blogs`, { waitUntil: "networkidle" });
    await page.waitForSelector("table tbody tr", { timeout: 5000 });
    await page.waitForTimeout(500);
    const beforeCount = await page.locator("table tbody tr").count();
    if (beforeCount === 0) record("delete", "no blogs to delete");
    else {
      await page.locator("table tbody tr").first().getByRole("button", { name: /Delete/i }).click({ force: true });
      // Confirm dialog
      await page.getByRole("button", { name: /^Delete$/ }).last().click({ force: true });
      await page.waitForTimeout(2000);
      const afterCount = await page.locator("table tbody tr").count();
      if (afterCount >= beforeCount) record("delete", `count did not decrease: ${beforeCount} → ${afterCount}`);
      else pass(`delete: ${beforeCount} → ${afterCount}`);
    }
  } catch (e) { record("scenario", "delete failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 17: Admin can see Users page
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "17-admin-users");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    try { await page.waitForURL(/\/dashboard/, { timeout: 5000 }); } catch {}
    await page.waitForTimeout(500);
    await page.goto(`${FRONT}/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const table = await page.locator("table").count();
    if (!table) record("admin", "Users table missing");
    else pass("admin /admin/users table rendered");
  } catch (e) { record("scenario", "admin/users failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 17b: Non-admin user blocked from /admin/users
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "17b-rbac-admin");
  try {
    // Seed a normal user via API
    const email = `rbac-${Date.now()}@example.com`;
    await page.request.post(`${API}/api/auth/register`, {
      data: { firstname: "RBAC", lastname: "Test", email, password: "password123" },
    });
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.goto(`${FRONT}/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const url = page.url();
    if (url.includes("/admin/users")) record("rbac", `non-admin reached /admin/users: ${url}`);
    else pass(`non-admin redirected from /admin/users → ${url}`);
  } catch (e) { record("scenario", "rbac failed: " + e.message); }
  await ctx.close();
}
{
  const { ctx, page } = await newPage(browser, "18-logout");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);
    // Open profile menu in navbar
    await page.locator('button[aria-haspopup="menu"]').first().click({ force: true });
    await page.waitForTimeout(300);
    await page.getByRole("menuitem", { name: "Logout" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    const url = page.url();
    if (!url.endsWith("/login")) record("logout", `expected /login, got ${url}`);
    else pass("logout redirected to /login");
  } catch (e) { record("scenario", "logout failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 18b: Logout via sidebar
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "18b-logout-sidebar");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.locator("aside").getByRole("button", { name: "Logout" }).click({ force: true });
    await page.waitForTimeout(800);
    const url = page.url();
    if (!url.endsWith("/login")) record("logout-sidebar", `expected /login, got ${url}`);
    else pass("sidebar logout redirected to /login");
  } catch (e) { record("scenario", "sidebar logout failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 18c: Visit protected route after logout (token cleared)
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "18c-after-logout");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    // Manually clear the token (simulates user clearing cookies/storage)
    await page.evaluate(() => localStorage.removeItem("blogspace_token"));
    await page.goto(`${FRONT}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const url = page.url();
    if (!url.endsWith("/login")) record("after-logout", `/dashboard accessible after token cleared: ${url}`);
    else pass("cleared token blocks protected route");
  } catch (e) { record("scenario", "after-logout failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 19: Page refresh keeps you logged in (token persisted)
// ------------------------------------------------------------------
{
  const { ctx, page } = await newPage(browser, "19-refresh-keeps");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.goto(`${FRONT}/dashboard`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const url = page.url();
    if (url.endsWith("/login")) record("refresh", "session lost on refresh");
    else pass("session persisted across refresh");
  } catch (e) { record("scenario", "refresh failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Scenario 20: Mobile viewport — sidebar drawer
// ------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await ctx.newPage();
  await attachLoggers(page, "20-mobile");
  try {
    await page.goto(`${FRONT}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    const burger = await page.getByRole("button", { name: /Open menu/i }).count();
    if (!burger) record("mobile", "no mobile menu trigger");
    else pass("mobile burger visible");
  } catch (e) { record("scenario", "mobile failed: " + e.message); }
  await ctx.close();
}

// ------------------------------------------------------------------
// Done
// ------------------------------------------------------------------
await browser.close();

writeFileSync(`${OUT}/results.json`, JSON.stringify({ issues, ok }, null, 2));
console.log("\n=== Audit Complete ===");
console.log(`✅ ${ok.length} passes`);
console.log(`❌ ${issues.length} issues`);
console.log(`\nDetailed results: ${OUT}/results.json`);