import { apiRequest } from '@/lib/api';

export const getFixedCosts = () => apiRequest('/api/fixed-costs');
export const createFixedCost = (data) => apiRequest('/api/fixed-costs', { method: 'POST', body: JSON.stringify(data) });
export const updateFixedCost = (id, data) => apiRequest(`/api/fixed-costs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFixedCost = (id) => apiRequest(`/api/fixed-costs/${id}`, { method: 'DELETE' });
