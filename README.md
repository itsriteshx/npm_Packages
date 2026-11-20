# ritesh-currency-converter

[![npm version](https://img.shields.io/npm/v/ritesh-currency-converter.svg)](https://www.npmjs.com/package/ritesh-currency-converter)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A high-performance, feature-packed JavaScript & TypeScript currency conversion library for Node.js and browsers. Features smart in-memory caching, batch multi-currency conversions, localized currency formatting, and full type definitions.

---

## 🌟 Key Features

- ⚡ **Smart In-Memory Caching**: Caches exchange rates with configurable TTL (default 15 mins) to prevent rate limits and deliver ultra-fast (<1ms) repeated conversions.
- 🔀 **Batch Conversions (`convertMany`)**: Convert an amount into multiple currencies in a single API call.
- 💵 **Currency Formatter (`formatCurrency`)**: Built-in localized currency formatting using `Intl.NumberFormat` with proper currency symbols (`$`, `€`, `₹`, `£`).
- 🛡️ **Auto-Sanitization & Validation**: Automatically handles lowercase codes (`'usd'` ➔ `'USD'`), trims whitespace, and validates positive numerical amounts.
- 📝 **Full TypeScript Support**: Shipped with comprehensive `.d.ts` type definitions for complete IntelliSense and autocomplete.
- 🚀 **Dual Interface**: Use functional exports or the object-oriented `CurrencyConverter` class.

---

## 📦 Installation

```bash
npm install ritesh-currency-converter
```

---

## 🚀 Quick Start

### 1. Simple Currency Conversion

```javascript
import { convertCurrency } from "ritesh-currency-converter";

// Convert 100 USD to INR
const inrAmount = await convertCurrency("USD", "INR", 100);
console.log(`100 USD = ₹${inrAmount.toFixed(2)}`);
// Output: 100 USD = ₹8329.54
```

### 2. Multi-Currency Conversion (`convertMany`)

Convert an amount into multiple target currencies in a single operation:

```javascript
import { convertMany } from "ritesh-currency-converter";

const results = await convertMany("USD", ["EUR", "INR", "GBP", "JPY"], 100);
console.log(results);
/*
Output:
{
  EUR: 92.51,
  INR: 8329.54,
  GBP: 79.12,
  JPY: 15420.50
}
*/
```

### 3. Localized Currency Formatting (`formatCurrency`)

```javascript
import { formatCurrency } from "ritesh-currency-converter";

console.log(formatCurrency(8329.54, "INR", "en-IN")); // Output: "₹8,329.54"
console.log(formatCurrency(1234.56, "USD", "en-US")); // Output: "$1,234.56"
console.log(formatCurrency(500, "EUR", "de-DE"));     // Output: "500,00 €"
```

### 4. Fetch All Available Exchange Rates (`getRates`)

```javascript
import { getRates } from "ritesh-currency-converter";

const allRates = await getRates("USD");
console.log(allRates);
// Output: { EUR: 0.925, INR: 83.29, GBP: 0.791, ... }
```

### 5. Currency Metadata & Symbols

```javascript
import { getCurrencyInfo, getSupportedCurrencies } from "ritesh-currency-converter";

const inr = getCurrencyInfo("INR");
console.log(inr);
// Output: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }

const allCurrencies = getSupportedCurrencies();
console.log(`Supported: ${allCurrencies.length} currencies`);
```

---

## ⚙️ Configuration & Custom API Key

By default, the package includes a working fallback key. You can also configure your own [Freecurrencyapi](https://freecurrencyapi.com) API key:

### Global Configuration
```javascript
import { configure } from "ritesh-currency-converter";

configure({
  apiKey: "YOUR_CUSTOM_API_KEY",
  cacheTTL: 30 * 60 * 1000, // Cache for 30 minutes (in ms)
  useCache: true,
});
```

Or pass `process.env.FREECURRENCY_API_KEY` in your environment.

### Class-Based Client

```javascript
import { CurrencyConverter } from "ritesh-currency-converter";

const converter = new CurrencyConverter({
  apiKey: "YOUR_API_KEY",
  cacheTTL: 10 * 60 * 1000, // 10 minutes
  useCache: true,
});

const result = await converter.convert("USD", "EUR", 250);
console.log(result);
```

---

## 📖 API Reference

### `convertCurrency(from, to, units?, options?)`
- `from` *(string)*: Base currency (case-insensitive, e.g. `'USD'`).
- `to` *(string)*: Target currency (case-insensitive, e.g. `'INR'`).
- `units` *(number, optional)*: Amount to convert (default: `1`).
- `options` *(object, optional)*: `{ apiKey, useCache, cacheTTL }`.
- Returns: `Promise<number>`.

### `convertMany(from, toCurrencies[], units?, options?)`
- `from` *(string)*: Base currency.
- `toCurrencies` *(string[])*: Array of target currency codes.
- `units` *(number, optional)*: Amount to convert (default: `1`).
- Returns: `Promise<Record<string, number>>`.

### `formatCurrency(amount, currency?, locale?, formatOptions?)`
- `amount` *(number)*: Numerical value to format.
- `currency` *(string, default: 'USD')*: 3-letter currency code.
- `locale` *(string, default: 'en-US')*: BCP 47 language code.
- Returns: `string`.

### `getRates(baseCurrency?, options?)`
- Returns: `Promise<Record<string, number>>`.

### `clearCache()`
- Clears the in-memory cache manually.

---

## 👨‍💻 Author

**Ritesh**
- GitHub: [@itsriteshx](https://github.com/itsriteshx)
- Email: royalritesh749291@gmail.com

---

## 📄 License

Licensed under the [ISC License](LICENSE).
