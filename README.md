# css-currency-converter

[![npm version](https://img.shields.io/npm/v/css-currency-converter.svg)](https://www.npmjs.com/package/css-currency-converter)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A lightweight and easy-to-use JavaScript/Node.js package to convert currencies in real-time.

---

## 🚀 Features

- ⚡ **Simple & Intuitive API**: Convert between currencies in a single function call.
- 🔄 **Promise & async/await Support**: Clean asynchronous integration.
- 📦 **ES Module Ready**: Works seamlessly with modern JavaScript and Node.js (`"type": "module"`).

---

## 📦 Installation

Install the package via npm:

```bash
npm install css-currency-converter
```

---

## 💻 Usage

### Using `async / await` (Recommended)

```javascript
import { convertCurrency } from "css-currency-converter";

async function run() {
  try {
    const result = await convertCurrency("USD", "EUR", 100);
    console.log(`100 USD = ${result} EUR`);
  } catch (error) {
    console.error("Conversion failed:", error);
  }
}

run();
```

### Using Promises (`.then / .catch`)

```javascript
import { convertCurrency } from "css-currency-converter";

convertCurrency("USD", "INR", 50)
  .then((result) => console.log(`Converted amount: ${result}`))
  .catch((err) => console.error(err));
```

---

## 📖 API Reference

### `convertCurrency(fromCurrency, toCurrency, units)`

Converts an amount from one currency to another using the latest exchange rates.

#### Parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `fromCurrency` | `string` | The base 3-letter currency code (e.g. `"USD"`, `"EUR"`, `"INR"`). |
| `toCurrency` | `string` | The target 3-letter currency code (e.g. `"EUR"`, `"GBP"`, `"JPY"`). |
| `units` | `number` | The amount of base currency you want to convert. |

#### Returns:

- `Promise<number>`: Resolves to the converted value.

---

## 🌐 Common Supported Currency Codes

Supports standard 3-letter ISO currency codes, including:

- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `INR` - Indian Rupee
- `JPY` - Japanese Yen
- `CAD` - Canadian Dollar
- `AUD` - Australian Dollar
- `CHF` - Swiss Franc
- And more!

---

## 👨‍💻 Author

**Ritesh**
- GitHub: [@itsriteshx](https://github.com/itsriteshx)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

