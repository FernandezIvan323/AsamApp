import { chromium, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { PrismaClient } = require(path.resolve(__dirname, '../../backend/node_modules/@prisma/client'));
const crypto = require('node:crypto');

const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');
const APP_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function signToken(userId) {
  const issuedAt = Date.now();
  const payload = `${userId}:${issuedAt}`;
  const secret = process.env.AUTH_SECRET || 'asamapp-dev-secret-change-me';
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

async function ensureCapturesUser() {
  const prisma = new PrismaClient();
  try {
    const username = 'captures-bot';
    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'captures@asamapp.local',
          username,
          password: hashPassword('captures123'),
          role: 'admin',
          active: true,
        },
      });
      console.log('Usuario captures-bot creado');
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { active: true } });
      console.log('Usuario captures-bot reactivado');
    }
    const token = signToken(user.id);
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function captureDashboard() {
  const auth = await ensureCapturesUser();
  console.log('Autenticado como:', auth.user.username);

  const browser = await chromium.launch();

  // ============ DESKTOP ============
  const desktopContext = await browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.addInitScript(({ token, user }) => {
    localStorage.setItem('asamapp_token', token);
    localStorage.setItem('asamapp_user', JSON.stringify(user));
  }, auth);

  await desktopPage.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(3000);
  await desktopPage.screenshot({
    path: path.join(SCREENSHOTS_DIR, '05-dashboard.png'),
    fullPage: false,
  });
  console.log('Captura desktop OK: 05-dashboard.png');
  await desktopContext.close();

  // ============ MOBILE ============
  // Pixel 5 viewport: 393x851 (representa bien un smartphone moderno)
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.addInitScript(({ token, user }) => {
    localStorage.setItem('asamapp_token', token);
    localStorage.setItem('asamapp_user', JSON.stringify(user));
  }, auth);

  await mobilePage.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3000);

  // En mobile el sidebar está oculto, capturamos full page para ver todo el dashboard
  await mobilePage.screenshot({
    path: path.join(SCREENSHOTS_DIR, '06-dashboard-mobile.png'),
    fullPage: true,
  });
  console.log('Captura mobile OK: 06-dashboard-mobile.png');
  await mobileContext.close();

  await browser.close();
}

captureDashboard().catch(err => {
  console.error('Error generando capturas:', err);
  process.exit(1);
});
