import { apiRequest } from '@/lib/api';

export function getQuoteTemplates() {
  return apiRequest('/api/quote-templates');
}

export function createQuoteTemplate(template) {
  return apiRequest('/api/quote-templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
}

export function updateQuoteTemplate(id, template) {
  return apiRequest(`/api/quote-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
}

export function deleteQuoteTemplate(id) {
  return apiRequest(`/api/quote-templates/${id}`, {
    method: 'DELETE',
  });
}
