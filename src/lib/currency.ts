// Currency conversion utilities
// Base currency: GBP
// Exchange rates relative to GBP

export const EXCHANGE_RATES = {
  GBP: 1.0,    // Base currency
  EUR: 1.15,   // 1 GBP = 1.15 EUR
  USD: 1.33,   // 1 GBP = 1.33 USD
  // AUD: 1.85, // Easy to add in the future
} as const;

export type Currency = keyof typeof EXCHANGE_RATES;

/**
 * Convert any currency amount to GBP (base currency)
 * @param amount - Amount in source currency
 * @param fromCurrency - Source currency
 * @returns Amount in GBP
 */
export function convertToGBP(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === 'GBP') return amount;
  return amount / EXCHANGE_RATES[fromCurrency];
}

/**
 * Convert GBP amount to any currency
 * @param amount - Amount in GBP
 * @param toCurrency - Target currency
 * @returns Amount in target currency
 */
export function convertFromGBP(amount: number, toCurrency: Currency): number {
  if (toCurrency === 'GBP') return amount;
  return amount * EXCHANGE_RATES[toCurrency];
}

/**
 * Calculate tokens from any currency amount
 * Always converts to GBP first, then calculates tokens
 * @param amount - Amount in source currency
 * @param currency - Source currency
 * @returns Number of tokens (rounded to whole number)
 */
export function calculateTokens(amount: number, currency: Currency): number {
  const amountInGBP = convertToGBP(amount, currency);
  const tokens = amountInGBP * 100; // 1 GBP = 100 tokens
  return Math.round(tokens);
}

/**
 * Calculate amount needed for specific number of tokens
 * @param tokens - Number of tokens needed
 * @param currency - Target currency
 * @returns Amount needed in target currency
 */
export function calculateAmountForTokens(tokens: number, currency: Currency): number {
  const amountInGBP = tokens / 100; // 100 tokens = 1 GBP
  return convertFromGBP(amountInGBP, currency);
}

/**
 * Get minimum amount for a currency
 * @param currency - Currency
 * @returns Minimum amount (0.01 for all currencies)
 */
export function getMinimumAmount(currency: Currency): number {
  return 0.01;
}

/**
 * Format currency amount with proper symbol
 * @param amount - Amount
 * @param currency - Currency
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    // AUD: 'A$',
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}
