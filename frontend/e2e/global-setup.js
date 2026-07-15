import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '../../backend');

export default async function globalSetup() {
  const username = process.env.E2E_USER || 'e2e_workflow';
  const password = process.env.E2E_PASSWORD || 'e2e-pass-AsamApp1';
  try {
    execSync(`node scripts/ensure-e2e-user.js ${username} ${password}`, {
      cwd: backendDir,
      stdio: 'inherit',
    });
  } catch (err) {
    console.warn('[e2e] No se pudo asegurar usuario E2E:', err.message);
  }
}
