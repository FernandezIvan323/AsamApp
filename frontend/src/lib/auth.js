const TOKEN_KEY = 'asamapp_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}
