export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadExport({ type = 'all', format = 'json' }) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const headers = {};
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('asamapp_token') : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${base}/api/export?type=${type}&format=${format}`, { headers });
  if (!response.ok) throw new Error('No se pudo exportar');
  const blob = await response.blob();
  const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
    || `asamapp-${type}.${format}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
