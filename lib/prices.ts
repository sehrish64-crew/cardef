export const PRICING_MAP: Record<
  string,
  { basic: number; standard: number; premium: number }
> = {
  USD: { basic: 40, standard: 60, premium: 80 },
  EUR: { basic: 27.99, standard: 46.99, premium: 65.99 },
  GBP: { basic: 24.99, standard: 41.99, premium: 58.99 },
  AUD: { basic: 44.99, standard: 74.99, premium: 104.99 },
  PLN: { basic: 119.99, standard: 199.99, premium: 279.99 },
  SEK: { basic: 299.99, standard: 499.99, premium: 699.99 },
  AED: { basic: 109.99, standard: 183.99, premium: 257.99 },
  MDL: { basic: 539.99, standard: 899.99, premium: 1259.99 },
  BAM: { basic: 54.99, standard: 91.99, premium: 128.99 },
  RON: { basic: 139.99, standard: 233.99, premium: 327.99 },
  DKK: { basic: 209.99, standard: 349.99, premium: 489.99 },
  CHF: { basic: 27.99, standard: 46.99, premium: 65.99 },
  CZK: { basic: 699.99, standard: 1166.99, premium: 1633.99 },
  BGN: { basic: 54.99, standard: 91.99, premium: 128.99 },
  HUF: { basic: 10999.99, standard: 18333.99, premium: 25666.99 },
  UAH: { basic: 1199.99, standard: 1999.99, premium: 2799.99 },
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  PLN: "zł",
  SEK: "kr",
  AED: "د.إ",
  MDL: "L",
  BAM: "KM",
  RON: "lei",
  DKK: "kr",
  CHF: "CHF",
  CZK: "Kč",
  BGN: "лв",
  HUF: "Ft",
  UAH: "₴",
};

export function getPrice(
  packageId: "basic" | "standard" | "premium",
  currency = "USD",
) {
  const pricing = PRICING_MAP[currency] || PRICING_MAP["USD"];
  return pricing[packageId];
}

// Map of external price/product IDs (e.g. Stripe price IDs) for specific packages.
// Add your provider-specific price ids here. The user provided `pri_01kg4gy97s9knjqxs7nw1t7dyy` for Basic.
export const EXTERNAL_PRICE_IDS: Record<string, string | undefined> = {
  basic: "pri_01kpx69v8srys2nn3vvs0hpd7n",
  standard: "pri_01kpx6b8k88xwt72q96t4s4gr9",
  premium: "pri_01kpx6cjwpym3bv6nfywwcqqsg",
};

export function getExternalPriceId(
  packageId: "basic" | "standard" | "premium",
) {
  return EXTERNAL_PRICE_IDS[packageId];
}

// Paddle LIVE price IDs (vendor 281569)
export const PADDLE_PRICE_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = {
  basic: "pri_01kpx69v8srys2nn3vvs0hpd7n",
  standard: "pri_01kpx6b8k88xwt72q96t4s4gr9",
  premium: "pri_01kpx6cjwpym3bv6nfywwcqqsg",
};

// Paddle SANDBOX price IDs (vendor 46857) — for localhost testing
export const PADDLE_SANDBOX_PRICE_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = {
  basic: "pri_01kpx4cfcq5e5yx745387mv0t9",
  standard: "pri_01kpx4ebzv90dg2gzkq3wybhs1",
  premium: "pri_01kpxqafppywh4r6vve9n96wan",
};

// Paddle LIVE product IDs (pro_...) — vendor 281569
export const PADDLE_PRODUCT_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = {
  basic: "pro_01kpx6903mtxkkrnkar60z6p9n",
  standard: "pro_01kpx6af16gcb4d825h371mfag",
  premium: "pro_01kpx6bv878ra9s6eyzn0bktn5",
};

// Paddle SANDBOX product IDs (pro_...) — vendor 46857 (UPDATED)
export const PADDLE_SANDBOX_PRODUCT_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = {
  basic: "pro_01kpx4bpe4mxv9vrqyg1et3tzt",
  standard: "pro_01kpx4ct2gy3bv6snc60s7mbsf",
  premium: "pro_01kpx4ewg35hgbe1jtesjj439m",
};

// Deprecated — kept for backwards compatibility
export const PADDLE_TEST_PRICE_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = PADDLE_SANDBOX_PRICE_IDS;
export const PADDLE_TEST_PRODUCT_IDS: Record<
  "basic" | "standard" | "premium",
  string
> = PADDLE_SANDBOX_PRODUCT_IDS;

// Unified package mapping — automatically picks sandbox or live based on environment variable
const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";
const isLive = paddleEnv === "production" || paddleEnv === "live";

export const PACKAGES: Record<
  "basic" | "standard" | "premium",
  { priceId: string; productId: string }
> = {
  basic: {
    priceId: isLive ? PADDLE_PRICE_IDS.basic : PADDLE_SANDBOX_PRICE_IDS.basic,
    productId: isLive
      ? PADDLE_PRODUCT_IDS.basic
      : PADDLE_SANDBOX_PRODUCT_IDS.basic,
  },
  standard: {
    priceId: isLive
      ? PADDLE_PRICE_IDS.standard
      : PADDLE_SANDBOX_PRICE_IDS.standard,
    productId: isLive
      ? PADDLE_PRODUCT_IDS.standard
      : PADDLE_SANDBOX_PRODUCT_IDS.standard,
  },
  premium: {
    priceId: isLive
      ? PADDLE_PRICE_IDS.premium
      : PADDLE_SANDBOX_PRICE_IDS.premium,
    productId: isLive
      ? PADDLE_PRODUCT_IDS.premium
      : PADDLE_SANDBOX_PRODUCT_IDS.premium,
  },
};

export function getPaddlePriceId(packageId: "basic" | "standard" | "premium") {
  // Use packages mapping which automatically handles sandbox/production environment
  return PACKAGES[packageId]?.priceId;
}

export function getPaddleProductId(
  packageId: "basic" | "standard" | "premium",
) {
  return PACKAGES[packageId]?.productId || PADDLE_TEST_PRODUCT_IDS[packageId];
}

export function getCurrencySymbol(currency = "USD") {
  return CURRENCY_SYMBOLS[currency] || "$";
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback to simple formatting
    const symbol = getCurrencySymbol(currency);
    return `${symbol} ${amount.toFixed(2)}`;
  }
}
