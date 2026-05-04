/**
 * Extracts the hostname from a URL.
 * Returns '—' for null/undefined, raw string if parsing fails.
 */
export function getDomain(url) {
  if (!url) return '—';
  try { return new URL(url).hostname; } catch { return url; }
}

/**
 * Formats a 1-based counter: '01 / 03'
 */
export function formatCounter(index, total) {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}
