import { chromium, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');
const APP_URL = 'http://localhost:5173';

async function captureLanding() {
  const browser = await chromium.launch();

  // ============ LANDING DESKTOP ============
  const desktopContext = await browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`${APP_URL}/landing/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({
    path: path.join(SCREENSHOTS_DIR, '01-landing.png'),
    fullPage: false,
  });
  console.log('Captura landing desktop OK');
  await desktopContext.close();

  // ============ LANDING MOBILE ============
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${APP_URL}/landing/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOTS_DIR, '02-landing-mobile.png'),
    fullPage: false,
  });
  console.log('Captura landing mobile OK');
  await mobileContext.close();

  await browser.close();
}

captureLanding().catch(err => {
  console.error('Error generando capturas de landing:', err);
  process.exit(1);
});
