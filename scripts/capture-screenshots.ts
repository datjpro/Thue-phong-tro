import { chromium } from "@playwright/test";
import { db } from "../src/db";
import { rooms } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function capture() {
  const [r101] = await db.select().from(rooms).where(eq(rooms.name, "Phòng 101")).limit(1);
  const roomId = r101?.id || "";

  const browser = await chromium.launch();
  
  // 1. Desktop view (Chủ trọ)
  const contextDesktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto("http://localhost:3000/login");
  await pageDesktop.fill('input[name="identifier"]', "chutro@example.com");
  await pageDesktop.fill('input[name="password"]', "chutro12345");
  await pageDesktop.click('button[type="submit"]');
  await pageDesktop.waitForURL("http://localhost:3000/**", { timeout: 10000 });
  await pageDesktop.waitForTimeout(1000);

  // Take screenshot of room 101 detail (showing TenantAccountCard)
  if (roomId) {
    await pageDesktop.goto(`http://localhost:3000/rooms/${roomId}`);
    await pageDesktop.waitForTimeout(1000);
    await pageDesktop.screenshot({ path: "shots/desktop-room-detail.png" });

    // Go to Settings page
    await pageDesktop.goto("http://localhost:3000/settings");
    await pageDesktop.waitForTimeout(1000);
    await pageDesktop.screenshot({ path: "shots/settings-page.png" });

    // Go to Tenants page
    await pageDesktop.goto("http://localhost:3000/tenants");
    await pageDesktop.waitForTimeout(1000);
    await pageDesktop.screenshot({ path: "shots/tenants-page.png" });

    // Toggle sidebar collapse to see rail mode
    const collapseBtn = await pageDesktop.$('button[title*="Thu nhỏ"], button[aria-label*="Thu gọn"], button[aria-label*="Thu nhỏ"]');
    if (collapseBtn) {
      await collapseBtn.click();
      await pageDesktop.waitForTimeout(500);
      await pageDesktop.screenshot({ path: "shots/desktop-room-detail-rail.png" });
    }
  }

  // 2. Mobile view (Chủ trọ)
  const contextMobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto("http://localhost:3000/login");
  await pageMobile.fill('input[name="identifier"]', "chutro@example.com");
  await pageMobile.fill('input[name="password"]', "chutro12345");
  await pageMobile.click('button[type="submit"]');
  await pageMobile.waitForURL("http://localhost:3000/**", { timeout: 10000 });
  await pageMobile.waitForTimeout(1000);

  if (roomId) {
    await pageMobile.goto(`http://localhost:3000/rooms/${roomId}`);
    await pageMobile.waitForTimeout(1000);
    await pageMobile.screenshot({ path: "shots/mobile-room-detail.png" });
  }

  // 3. Test Tenant Login with Room Number "101" and CCCD "001201001234"
  const contextTenant = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const pageTenant = await contextTenant.newPage();
  await pageTenant.goto("http://localhost:3000/login");
  await pageTenant.screenshot({ path: "shots/login-page.png" });
  await pageTenant.fill('input[name="identifier"]', "101");
  await pageTenant.fill('input[name="password"]', "001200001234");
  await pageTenant.click('button[type="submit"]');
  await pageTenant.waitForURL("http://localhost:3000/**", { timeout: 10000 });
  await pageTenant.waitForTimeout(1000);
  await pageTenant.screenshot({ path: "shots/tenant-logged-in.png" });

  await browser.close();
  console.log("Tenant login test and all screenshots captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
