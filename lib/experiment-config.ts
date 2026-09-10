export type CohortVariant = 'control' | 'annual_discount' | 'feature_bundle';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

// Deterministic 32-bit FNV-1a hash
export function hashStringToCohort(input: string): CohortVariant {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const bucket = Math.abs(hash >>> 0) % 100;

  if (bucket < 40) return 'control';         // 40%
  if (bucket < 70) return 'annual_discount'; // 30%
  return 'feature_bundle';                   // 30%
}

export const GEO_CURRENCY_MAP: Record<string, CurrencyCode> = {
  US: 'USD', CA: 'USD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR',
  GB: 'GBP',
};

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
};