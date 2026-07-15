import { request as apiRequest, test } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';

/**
 * Contexto HTTP con Bearer token si AUTH está habilitado.
 * Credenciales: E2E_USER / E2E_PASSWORD (defaults para primer registro).
 */
export async function createAuthedApiContext() {
  const bare = await apiRequest.newContext({ baseURL: API_URL });
  const configRes = await bare.get('/api/auth/config');
  if (!configRes.ok()) {
    throw new Error(`No se pudo leer /api/auth/config (${configRes.status()})`);
  }
  const config = await configRes.json();

  if (!config.enabled) {
    return bare;
  }

  const username = process.env.E2E_USER || 'e2e_workflow';
  const password = process.env.E2E_PASSWORD || 'e2e-pass-AsamApp1';
  const email = process.env.E2E_EMAIL || `${username}@e2e.local`;

  let loginRes = await bare.post('/api/auth/login', {
    data: { username, password },
  });

  if (!loginRes.ok() && !config.hasUsers) {
    const reg = await bare.post('/api/auth/register', {
      data: { username, email, password },
    });
    if (!reg.ok()) {
      const body = await reg.text();
      throw new Error(`Registro E2E falló: ${reg.status()} ${body}`);
    }
    loginRes = await bare.post('/api/auth/login', {
      data: { username, password },
    });
  }

  if (!loginRes.ok()) {
    // Reintentar tras ensure-e2e-user (globalSetup debería haber corrido)
    const body = await loginRes.text();
    throw new Error(
      `Login E2E falló (${loginRes.status()}): ${body}. ` +
      `Corré: cd backend && node scripts/ensure-e2e-user.js`,
    );
  }

  const { token } = await loginRes.json();
  await bare.dispose();
  return apiRequest.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
