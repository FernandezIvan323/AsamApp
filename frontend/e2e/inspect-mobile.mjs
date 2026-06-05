import { chromium, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { PrismaClient } = require(path.resolve(__dirname, '../../backend/node_modules/@prisma/client'));
const crypto = require('node:crypto');

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
    }
    return {
      token: signToken(user.id),
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function inspectMobile() {
  const auth = await ensureCapturesUser();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 393, height: 851 },
  });
  const page = await context.newPage();

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('asamapp_token', token);
    localStorage.setItem('asamapp_user', JSON.stringify(user));
  }, auth);

  await page.goto('http://localhost:5173/app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Inspeccionar dimensiones
  const info = await page.evaluate(() => {
    const grid = document.querySelector('.app-grid') || document.querySelector('[style*="grid-template-columns"]');
    const aside = document.querySelector('aside');
    const main = document.querySelector('main');
    return {
      gridStyle: grid ? grid.getAttribute('style') : null,
      asideBox: aside ? aside.getBoundingClientRect().toJSON() : null,
      mainBox: main ? main.getBoundingClientRect().toJSON() : null,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  console.log('=== INFO DE DIMENSIONES ===');
  console.log(JSON.stringify(info, null, 2));

  await browser.close();
}

inspectMobile().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
