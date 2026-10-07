import { downloadRequest } from '@/lib/api';

export function downloadBlob(content, filename, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadExport({ type = 'all', format = 'json' }) {
  const blob = await downloadRequest(`/api/export?type=${type}&format=${format}`);
  return downloadBlob(blob, `asamapp-${type}.${format}`);
}
