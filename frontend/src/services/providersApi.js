import { apiRequest } from '@/lib/api';

export function getProviders() {
  return apiRequest('/api/providers');
}

export function createProvider(provider) {
  return apiRequest('/api/providers', {
    method: 'POST',
    body: JSON.stringify(provider),
  });
}

export function updateProvider(id, provider) {
  return apiRequest(`/api/providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(provider),
  });
}

export function deleteProvider(id) {
  return apiRequest(`/api/providers/${id}`, {
    method: 'DELETE',
  });
}
