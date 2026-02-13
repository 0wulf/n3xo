/**
 * Parse a date string (YYYY-MM-DD or YYYY-MM) to a Date object
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  }
  return new Date(dateStr);
}

/**
 * Format a date for display
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  const date = parseDate(dateStr);
  if (!date || isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format as month/year
 */
export function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  const date = parseDate(dateStr);
  if (!date || isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es', { year: 'numeric', month: 'short' });
}

/**
 * Check if a date is within a range [start, end]
 */
export function isDateInRange(dateStr, startStr, endStr) {
  if (!dateStr) return true; // no date = always visible
  const date = parseDate(dateStr);
  if (!date) return true;
  
  const start = startStr ? parseDate(startStr) : null;
  const end = endStr ? parseDate(endStr) : null;
  
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

/**
 * Get the min and max dates from a list of date strings
 */
export function getDateRange(dates) {
  const parsed = dates
    .filter(Boolean)
    .map(parseDate)
    .filter(d => d && !isNaN(d.getTime()));
  
  if (parsed.length === 0) return { min: '2020-01-01', max: '2026-12-31' };
  
  const min = new Date(Math.min(...parsed));
  const max = new Date(Math.max(...parsed));
  
  // Add 1 month padding on each side
  min.setMonth(min.getMonth() - 1);
  max.setMonth(max.getMonth() + 1);
  
  return {
    min: min.toISOString().slice(0, 10),
    max: max.toISOString().slice(0, 10),
  };
}

/**
 * Convert a date to a numeric value for slider (days since epoch)
 */
export function dateToValue(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return 0;
  return Math.floor(d.getTime() / 86400000);
}

/**
 * Convert slider value back to date string
 */
export function valueToDate(value) {
  const d = new Date(value * 86400000);
  return d.toISOString().slice(0, 10);
}
