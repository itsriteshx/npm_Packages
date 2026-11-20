import Freecurrencyapi from '@everapi/freecurrencyapi-js';

// Default fallback API key (can be overridden via configure() or options)
const DEFAULT_API_KEY =
  (typeof process !== 'undefined' && process.env?.FREECURRENCY_API_KEY) ||
  'fca_live_0vbJOAV5a4YVSPUO9Std0UwvoyD9sAndf0zN1ccL';

// Default configuration
const config = {
  apiKey: DEFAULT_API_KEY,
  cacheTTL: 15 * 60 * 1000, // 15 minutes default TTL in ms
  useCache: true,
};

// In-memory cache map: key -> { timestamp: number, rates: Record<string, number> }
const rateCache = new Map();

/**
 * Custom Error Class for Currency Operations
 */
export class CurrencyError extends Error {
  constructor(message, code = 'CURRENCY_ERROR') {
    super(message);
    this.name = 'CurrencyError';
    this.code = code;
  }
}

/**
 * Common supported currency metadata
 */
export const CURRENCY_METADATA = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
};

/**
 * Configure global settings
 * @param {Object} options
 * @param {string} [options.apiKey] - Your Freecurrencyapi API key
 * @param {number} [options.cacheTTL] - Cache duration in milliseconds (default: 15 mins)
 * @param {boolean} [options.useCache] - Enable or disable caching (default: true)
 */
export function configure(options = {}) {
  if (options.apiKey !== undefined) config.apiKey = options.apiKey;
  if (options.cacheTTL !== undefined) config.cacheTTL = options.cacheTTL;
  if (options.useCache !== undefined) config.useCache = Boolean(options.useCache);
}

/**
 * Clear the in-memory cache
 */
export function clearCache() {
  rateCache.clear();
}

/**
 * Validate and sanitize 3-letter currency code
 */
function sanitizeCurrency(code, paramName = 'currency') {
  if (!code || typeof code !== 'string') {
    throw new CurrencyError(
      `Invalid ${paramName}: Expected a non-empty 3-letter currency string. Received: ${code}`,
      'INVALID_CURRENCY_CODE'
    );
  }
  const clean = code.trim().toUpperCase();
  if (clean.length !== 3) {
    throw new CurrencyError(
      `Invalid ${paramName}: "${code}" is not a valid 3-letter ISO currency code.`,
      'INVALID_CURRENCY_CODE'
    );
  }
  return clean;
}

/**
 * Validate amount/units
 */
function sanitizeAmount(amount) {
  const num = Number(amount);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    throw new CurrencyError(
      `Invalid amount: Expected a positive finite number. Received: ${amount}`,
      'INVALID_AMOUNT'
    );
  }
  return num;
}

/**
 * Fetch rates with in-memory caching
 */
async function fetchRates(baseCurrency, targetCurrencies = [], options = {}) {
  const base = sanitizeCurrency(baseCurrency, 'baseCurrency');
  const apiKey = options.apiKey || config.apiKey;
  const useCache = options.useCache !== undefined ? options.useCache : config.useCache;
  const ttl = options.cacheTTL !== undefined ? options.cacheTTL : config.cacheTTL;

  // Check cache
  const cached = rateCache.get(base);
  const now = Date.now();
  if (useCache && cached && now - cached.timestamp < ttl) {
    // If target currencies specified, check if all targets exist in cached rates
    if (targetCurrencies.length > 0) {
      const allPresent = targetCurrencies.every((c) => cached.rates[c] !== undefined);
      if (allPresent) {
        return cached.rates;
      }
    } else {
      return cached.rates;
    }
  }

  // Make API call
  const client = new Freecurrencyapi(apiKey);
  const params = { base_currency: base };
  if (targetCurrencies.length > 0) {
    params.currencies = targetCurrencies.join(',');
  }

  try {
    const res = await client.latest(params);
    if (!res || !res.data) {
      throw new CurrencyError('API returned empty or invalid data response.', 'API_EMPTY_RESPONSE');
    }

    // Merge with existing cached rates for base
    const existingRates = cached?.rates || {};
    const updatedRates = { ...existingRates, ...res.data };

    if (useCache) {
      rateCache.set(base, {
        timestamp: now,
        rates: updatedRates,
      });
    }

    return updatedRates;
  } catch (err) {
    if (err instanceof CurrencyError) throw err;
    throw new CurrencyError(
      `Failed to fetch currency rates for ${base}: ${err.message}`,
      'API_FETCH_ERROR'
    );
  }
}

/**
 * Convert an amount from one currency to another
 *
 * @param {string} fromCurrency - Base currency code (e.g. 'USD', 'usd')
 * @param {string} toCurrency - Target currency code (e.g. 'EUR', 'INR')
 * @param {number} [units=1] - Amount to convert
 * @param {Object} [options] - Optional configurations
 * @returns {Promise<number>} - Converted value
 */
export async function convertCurrency(fromCurrency, toCurrency, units = 1, options = {}) {
  const from = sanitizeCurrency(fromCurrency, 'fromCurrency');
  const to = sanitizeCurrency(toCurrency, 'toCurrency');
  const amount = sanitizeAmount(units);

  // Instant return if same currency
  if (from === to) {
    return amount;
  }

  const rates = await fetchRates(from, [to], options);
  const rate = rates[to];

  if (rate === undefined) {
    throw new CurrencyError(
      `Exchange rate from ${from} to ${to} is currently unavailable.`,
      'RATE_NOT_FOUND'
    );
  }

  return rate * amount;
}

/**
 * Convert an amount into multiple target currencies in a single API call
 *
 * @param {string} fromCurrency - Base currency code (e.g. 'USD')
 * @param {string[]} toCurrencies - List of target currency codes (e.g. ['EUR', 'INR', 'GBP'])
 * @param {number} [units=1] - Amount to convert
 * @param {Object} [options] - Optional configurations
 * @returns {Promise<Record<string, number>>} - Map of target currency to converted amount
 */
export async function convertMany(fromCurrency, toCurrencies = [], units = 1, options = {}) {
  const from = sanitizeCurrency(fromCurrency, 'fromCurrency');
  const amount = sanitizeAmount(units);

  if (!Array.isArray(toCurrencies) || toCurrencies.length === 0) {
    throw new CurrencyError(
      'convertMany requires a non-empty array of target currencies.',
      'INVALID_ARGUMENT'
    );
  }

  const cleanTargets = toCurrencies.map((c) => sanitizeCurrency(c, 'targetCurrency'));
  const uniqueTargets = [...new Set(cleanTargets)];

  // Separate same-currency from API targets
  const targetsToFetch = uniqueTargets.filter((c) => c !== from);

  let rates = {};
  if (targetsToFetch.length > 0) {
    rates = await fetchRates(from, targetsToFetch, options);
  }

  const results = {};
  for (const target of uniqueTargets) {
    if (target === from) {
      results[target] = amount;
    } else if (rates[target] !== undefined) {
      results[target] = rates[target] * amount;
    } else {
      results[target] = null;
    }
  }

  return results;
}

/**
 * Get all available exchange rates for a base currency
 *
 * @param {string} [baseCurrency='USD'] - Base currency code
 * @param {Object} [options] - Optional configurations
 * @returns {Promise<Record<string, number>>} - Map of currency codes to exchange rates
 */
export async function getRates(baseCurrency = 'USD', options = {}) {
  const base = sanitizeCurrency(baseCurrency, 'baseCurrency');
  return fetchRates(base, [], options);
}

/**
 * Format a numeric amount into a localized currency string with symbol
 *
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - 3-letter currency code
 * @param {string} [locale='en-US'] - BCP 47 language tag (e.g. 'en-IN', 'de-DE')
 * @param {Intl.NumberFormatOptions} [formatOptions] - Intl.NumberFormat options
 * @returns {string} - Formatted currency string (e.g. "$1,234.56" or "₹1,234.56")
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US', formatOptions = {}) {
  const cleanCode = sanitizeCurrency(currency, 'currency');
  const cleanAmount = sanitizeAmount(amount);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cleanCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
      ...formatOptions,
    });
    return formatter.format(cleanAmount);
  } catch {
    // Fallback if specific currency is not recognized by Intl
    const symbol = CURRENCY_METADATA[cleanCode]?.symbol || cleanCode;
    return `${symbol}${cleanAmount.toLocaleString(locale, { minimumFractionDigits: 2 })}`;
  }
}

/**
 * Get metadata (name, symbol, flag) for a specific currency
 *
 * @param {string} currencyCode - 3-letter currency code
 * @returns {Object} - Currency metadata
 */
export function getCurrencyInfo(currencyCode) {
  const code = sanitizeCurrency(currencyCode);
  return (
    CURRENCY_METADATA[code] || {
      code,
      name: code,
      symbol: code,
      flag: '🌐',
    }
  );
}

/**
 * Get all supported currencies with metadata
 *
 * @returns {Array<Object>} - List of all supported currency objects
 */
export function getSupportedCurrencies() {
  return Object.values(CURRENCY_METADATA);
}

/**
 * Object-Oriented Converter Client
 */
export class CurrencyConverter {
  constructor(options = {}) {
    this.apiKey = options.apiKey || config.apiKey;
    this.cacheTTL = options.cacheTTL !== undefined ? options.cacheTTL : config.cacheTTL;
    this.useCache = options.useCache !== undefined ? options.useCache : config.useCache;
  }

  convert(fromCurrency, toCurrency, units = 1) {
    return convertCurrency(fromCurrency, toCurrency, units, {
      apiKey: this.apiKey,
      cacheTTL: this.cacheTTL,
      useCache: this.useCache,
    });
  }

  convertMany(fromCurrency, toCurrencies, units = 1) {
    return convertMany(fromCurrency, toCurrencies, units, {
      apiKey: this.apiKey,
      cacheTTL: this.cacheTTL,
      useCache: this.useCache,
    });
  }

  getRates(baseCurrency = 'USD') {
    return getRates(baseCurrency, {
      apiKey: this.apiKey,
      cacheTTL: this.cacheTTL,
      useCache: this.useCache,
    });
  }

  format(amount, currency = 'USD', locale = 'en-US', formatOptions = {}) {
    return formatCurrency(amount, currency, locale, formatOptions);
  }

  clearCache() {
    clearCache();
  }
}

export default {
  convertCurrency,
  convertMany,
  getRates,
  formatCurrency,
  getCurrencyInfo,
  getSupportedCurrencies,
  configure,
  clearCache,
  CurrencyConverter,
  CurrencyError,
  CURRENCY_METADATA,
};
