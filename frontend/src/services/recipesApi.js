import { apiRequest } from '@/lib/api';

export function getRecipes() {
  return apiRequest('/api/recipes');
}

export function createRecipe(recipe) {
  return apiRequest('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
}

export function updateRecipe(id, recipe) {
  return apiRequest(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(recipe),
  });
}

export function deleteRecipe(id) {
  return apiRequest(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
}
