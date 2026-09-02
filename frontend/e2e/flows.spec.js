import { test, expect } from '@playwright/test';

const USERNAME = `e2e_ui_${Date.now()}`;
const PASSWORD = 'ui-e2e-pass';
const EMAIL = `${USERNAME}@e2e.local`;

test.describe('Flujos UI críticos', () => {
  test.beforeEach(async ({ page }) => {
    // Silenciar consola de errores esperados (offline, etc.)
    page.on('pageerror', () => {});
  });

  test('registro: un usuario nuevo puede crear cuenta y ver el panel', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#email').fill(EMAIL);
    await page.locator('#username').fill(USERNAME);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('#confirm').fill(PASSWORD);

    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    // Tras registrar redirige al dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    // El layout principal aparece (sidebar o navbar)
    await expect(page.locator('main, [data-slot="sidebar"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('login: usuario registrado puede iniciar sesión', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#username').fill(USERNAME);
    await page.locator('#password').fill(PASSWORD);

    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test('acceso protegido: /new-purchase redirige a auth sin token', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/new-purchase');
    // AuthGate redirige a /login (si ya hay usuarios) o /register (si la BD está vacía)
    await expect(page).not.toHaveURL(/new-purchase/, { timeout: 10000 });
    await expect(page).toHaveURL(/(login|register)/, { timeout: 10000 });
  });
});
