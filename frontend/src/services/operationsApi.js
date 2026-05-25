import { apiRequest } from '@/lib/api';

export function getOperationsSummary() {
  return apiRequest('/api/operations/summary');
}

