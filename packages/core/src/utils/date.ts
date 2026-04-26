/**
 * Normalise a value that may be a Date object or an ISO string to a Date.
 */
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Format a date as a human-readable string.
 * Defaults to German locale.
 *
 * @example formatDate(new Date('2026-04-26')) → '26. Apr 2026'
 */
export function formatDate(date: Date | string, locale = 'de-DE'): string {
  return toDate(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date relative to today.
 *
 * @example
 *   formatRelative(today)     → 'Heute'
 *   formatRelative(yesterday) → 'Gestern'
 *   formatRelative(3daysAgo)  → 'vor 3 Tagen'
 *   formatRelative(future)    → 'in 2 Tagen'
 */
export function formatRelative(date: Date | string): string {
  const d = toDate(date);
  const now = new Date();

  // Normalise to day boundaries (midnight local time)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = dateStart.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Heute';
  if (diffDays === -1) return 'Gestern';
  if (diffDays === 1) return 'Morgen';
  if (diffDays < 0) return `vor ${Math.abs(diffDays)} Tagen`;
  return `in ${diffDays} Tagen`;
}

/**
 * Return true if the given date is strictly before today (past midnight).
 */
export function isOverdue(dueDate: Date | string): boolean {
  const d = toDate(dueDate);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d < todayStart;
}

/**
 * Return the number of calendar days until the given date.
 * Negative values mean the date is in the past.
 *
 * @example daysUntil(tomorrow) → 1
 * @example daysUntil(yesterday) → -1
 */
export function daysUntil(date: Date | string): number {
  const d = toDate(date);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = dateStart.getTime() - todayStart.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
