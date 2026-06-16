import { apiRequest } from '@/lib/api';

export function getClients() {
  return apiRequest('/api/clients');
}

export function getClient(id) {
  return apiRequest(`/api/clients/${id}`);
}

export function createClient(data) {
  return apiRequest('/api/clients', { method: 'POST', body: JSON.stringify(data) });
}

export function updateClient(id, data) {
  return apiRequest(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteClient(id) {
  return apiRequest(`/api/clients/${id}`, { method: 'DELETE' });
}
