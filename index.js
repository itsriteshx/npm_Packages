const YOUR_API_KEY='fca_live_0vbJOAV5a4YVSPUO9Std0UwvoyD9sAndf0zN1ccL'


import Freecurrencyapi from '@everapi/freecurrencyapi-js';

const freecurrencyapi = new Freecurrencyapi(YOUR_API_KEY);

export async function convertCurrency(fromCurrency, toCurrency, units) {
    const res = await freecurrencyapi.latest({
        base_currency: fromCurrency,
        currencies: toCurrency
    });

    const multiplier = res.data[toCurrency];

    return multiplier * units;
}