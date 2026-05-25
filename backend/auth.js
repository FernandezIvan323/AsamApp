import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isAuthEnabled() {
  return process.env.AUTH_ENABLED === 'true';
}

function getSecret() {
  return process.env.AUTH_SECRET || 'asamapp-dev-secret-change-me';
}

export function signToken(username) {
  const issuedAt = Date.now();
  const payload = `${username}:${issuedAt}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;
    const signature = parts.pop();
    const issuedAt = Number(parts.pop());
    const username = parts.join(':');
    const payload = `${username}:${issuedAt}`;
    const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
    if (signature !== expected) return null;
    if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;
    return username;
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  if (!req.path.startsWith('/api')) return next();
  if (!isAuthEnabled()) return next();

  const publicPaths = ['/api/health', '/api/auth/config', '/api/auth/login'];
  if (publicPaths.includes(req.path)) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesion.' });
  }
  req.user = verifyToken(token);
  return next();
}

export function handleAuthLogin(req, res) {
  if (!isAuthEnabled()) {
    return res.json({ enabled: false, token: null });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const expectedUser = process.env.AUTH_USERNAME || 'admin';
  const expectedPass = process.env.AUTH_PASSWORD || 'admin';

  if (username !== expectedUser || password !== expectedPass) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  return res.json({ token: signToken(username), username });
}

export function handleAuthConfig(_req, res) {
  res.json({ enabled: isAuthEnabled() });
}
