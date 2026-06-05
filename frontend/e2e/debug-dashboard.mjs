import { chromium, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

async function debugDashboard() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  await page.goto('http://localhost:5173/app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('=== MENSAJES DE CONSOLA ===');
  consoleMessages.forEach(m => console.log(m));
  console.log('\n=== ERRORES DE PÁGINA ===');
  pageErrors.forEach(e => console.log(e));
  console.log('\n=== CONTENIDO DEL BODY ===');
  const bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 500));

  await browser.close();
}

debugDashboard().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
