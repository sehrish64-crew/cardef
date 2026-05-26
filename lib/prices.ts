export type PriceKey = 'basic' | 'standard' | 'premium'

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'CA$',
  NZD: 'NZ$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  AED: 'د.إ',
}

export const PRICING_MAP: Record<string, Record<PriceKey, number>> = {
  USD: {
    basic: 50,
    standard: 70,
    premium: 90,
  },
  EUR: {
    basic: 50,
    standard: 70,
    premium: 90,
  },
  GBP: {
    basic: 50,
    standard: 70,
    premium: 90,
  },
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    return `${CURRENCY_SYMBOLS[currency] || '$'}${amount.toFixed(2)}`
  }
}

export function getPrice(packageKey: PriceKey, currency = 'USD') {
  const normalizedCurrency = String(currency || 'USD').toUpperCase()
  const currencyPrices = PRICING_MAP[normalizedCurrency] || PRICING_MAP['USD']
  return currencyPrices[packageKey] ?? PRICING_MAP['USD'][packageKey]
}

export function getExternalPriceId(packageKey: PriceKey) {
  return undefined
}

export function getPaddlePriceId(packageKey: PriceKey) {
  return undefined
}
