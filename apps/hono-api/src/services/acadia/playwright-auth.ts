import { chromium } from "playwright";

const BASE_URL = "https://collss.acadiau.ca";

export async function authenticateWithBrowser(
  username: string,
  password: string
) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/student/Account/Login`);

    await page.fill('input[name="UserName"]', username);
    await page.fill('input[name="Password"]', password);
    await page.click('button[type="submit"]');

    // Wait for network to become idle after login
    await page.waitForLoadState("networkidle", { timeout: 30_000 });

    // Check for error banner
    const errorBanner = page.locator(".esg-alert.esg-alert--error").first();
    const isErrorVisible = await errorBanner.isVisible().catch(() => false);

    if (isErrorVisible) {
      const errorMessage = await errorBanner
        .textContent()
        .catch(() => "Login Failed");
      throw new Error(`${errorMessage?.trim()}`);
    }

    // Extract cookies
    const cookies = await context.cookies();

    // Format cookies for axios
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } finally {
    await browser.close();
  }
}
