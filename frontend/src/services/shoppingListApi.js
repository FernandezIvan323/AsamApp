import { apiRequest } from '@/lib/api';

export function getShoppingList(statuses) {
  const query = statuses?.length ? `?statuses=${encodeURIComponent(statuses.join(','))}` : '';
  return apiRequest(`/api/shopping-list${query}`);
}
