import { apiRequest } from '@/lib/api';

export function getEvents() {
  return apiRequest('/api/events');
}

export function getEvent(id) {
  return apiRequest(`/api/events/${id}`);
}

export function createEvent(event) {
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export function updateEventStatus(id, status) {
  return apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function updateEvent(id, event) {
  return apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
}

export function getEventFinancials(id) {
  return apiRequest(`/api/events/${id}/financials`);
}

export function duplicateEvent(id, overrides = {}) {
  return apiRequest(`/api/events/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify(overrides),
  });
}

export function deleteEvent(id) {
  return apiRequest(`/api/events/${id}`, {
    method: 'DELETE',
  });
}

export function createEventTask(eventId, task) {
  return apiRequest(`/api/events/${eventId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateEventTask(eventId, taskId, task) {
  return apiRequest(`/api/events/${eventId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

export function createEventPayment(eventId, payment) {
  return apiRequest(`/api/events/${eventId}/payments`, {
    method: 'POST',
    body: JSON.stringify(payment),
  });
}
