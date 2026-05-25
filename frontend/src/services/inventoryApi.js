import { apiRequest } from '@/lib/api';

export function getInventoryItems() {
  return apiRequest('/api/inventory');
}

export function createInventoryItem(item) {
  return apiRequest('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export function updateInventoryItem(id, item) {
  return apiRequest(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export function deleteInventoryItem(id) {
  return apiRequest(`/api/inventory/${id}`, {
    method: 'DELETE',
  });
}

export function getStockMovements(itemId) {
  return apiRequest(`/api/inventory/${itemId}/stock-movements`);
}

export function createStockMovement(itemId, movement) {
  return apiRequest(`/api/inventory/${itemId}/stock-movements`, {
    method: 'POST',
    body: JSON.stringify(movement),
  });
}
