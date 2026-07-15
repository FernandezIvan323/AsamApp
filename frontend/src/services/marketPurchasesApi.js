import { apiRequest } from '@/lib/api';

export function getMarketPurchases({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  const query = params.toString();

  return apiRequest(`/api/market-purchases${query ? `?${query}` : ''}`);
}

export function getMarketPurchase(id) {
  return apiRequest(`/api/market-purchases/${id}`);
}

export function createMarketPurchase(purchase) {
  return apiRequest('/api/market-purchases', {
    method: 'POST',
    body: JSON.stringify(purchase),
  });
}

export function updateMarketPurchase(id, purchase) {
  return apiRequest(`/api/market-purchases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(purchase),
  });
}

export function deleteMarketPurchase(id) {
  return apiRequest(`/api/market-purchases/${id}`, {
    method: 'DELETE',
  });
}
