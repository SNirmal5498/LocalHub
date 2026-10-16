/**
 * Backend Indian Rupee (INR / ₹) Currency Utility
 * Uses Intl.NumberFormat with 'en-IN' locale and INR currency.
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_LOCALE = 'en-IN';

export const inrFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: 'currency',
  currency: CURRENCY_CODE,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(
  amount: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numeric === null || numeric === undefined || isNaN(numeric)) {
    return inrFormatter.format(0);
  }

  if (options) {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: 'currency',
      currency: CURRENCY_CODE,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(numeric);
  }

  return inrFormatter.format(numeric);
}
