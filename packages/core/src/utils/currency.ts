/**
 * Round a number to two decimal places (banker's rounding via toFixed).
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Format a numeric amount as a currency string.
 * Defaults to German locale with EUR.
 *
 * @example formatCurrency(23.5) → '23,50 €'
 */
export function formatCurrency(amount: number, locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a currency string back to a number.
 * Handles both '23,50 €' (de-DE) and '23.50' formats.
 */
export function parseCurrency(str: string): number {
  // Strip all non-numeric characters except comma and dot
  const stripped = str.replace(/[^\d,.-]/g, '');

  // If there is a comma followed by exactly two digits at the end → decimal separator
  if (/,\d{2}$/.test(stripped)) {
    // German format: remove thousands dots, replace decimal comma with dot
    const normalized = stripped.replace(/\./g, '').replace(',', '.');
    return Number.parseFloat(normalized);
  }

  // Otherwise treat it as a standard float string
  const normalized = stripped.replace(',', '');
  return Number.parseFloat(normalized);
}

/**
 * Split a total amount equally among `count` people.
 * The last person absorbs the rounding remainder so the parts always sum to total.
 *
 * @example calculateEqualSplit(10, 3) → [3.33, 3.33, 3.34]
 */
export function calculateEqualSplit(total: number, count: number): number[] {
  if (count <= 0) return [];

  const base = roundToTwo(Math.floor((total / count) * 100) / 100);
  const parts: number[] = Array(count).fill(base) as number[];

  // Remainder in cents
  const remainder = roundToTwo(total - base * count);
  const lastIndex = count - 1;
  // biome-ignore lint/style/noNonNullAssertion: index is always valid
  parts[lastIndex] = roundToTwo(parts[lastIndex]! + remainder);

  return parts;
}
