import { apiRequest, downloadRequest } from '@/lib/api';

export const getNotes = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ).toString();
  return apiRequest(`/api/notes${query ? `?${query}` : ''}`);
};

export const getNote = (id) =>
  apiRequest(`/api/notes/${id}`);

export const createNote = (data) =>
  apiRequest('/api/notes', { method: 'POST', body: JSON.stringify(data) });

export const updateNote = (id, data) =>
  apiRequest(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteNote = (id) =>
  apiRequest(`/api/notes/${id}`, { method: 'DELETE' });

export const archiveNote = (id) =>
  apiRequest(`/api/notes/${id}/archive`, { method: 'POST' });

export const restoreNote = (id) =>
  apiRequest(`/api/notes/${id}/restore`, { method: 'POST' });

export const exportNotes = (format = 'json') =>
  downloadRequest(`/api/notes-export?format=${format}`);
