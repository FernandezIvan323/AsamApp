import { apiRequest } from '@/lib/api';

export function getEmployees() {
  return apiRequest('/api/employees');
}

export function getEmployee(id) {
  return apiRequest(`/api/employees/${id}`);
}

export function createEmployee(data) {
  return apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(data) });
}

export function updateEmployee(id, data) {
  return apiRequest(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteEmployee(id) {
  return apiRequest(`/api/employees/${id}`, { method: 'DELETE' });
}

export function getEmployeeActivities() {
  return apiRequest('/api/employee-activities');
}

export function createEmployeeActivity(data) {
  return apiRequest('/api/employee-activities', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteEmployeeActivity(id) {
  return apiRequest(`/api/employee-activities/${id}`, { method: 'DELETE' });
}
