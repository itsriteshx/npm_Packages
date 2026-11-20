import assert from 'node:assert';
import {
  convertCurrency,
  convertMany,
  formatCurrency,
  getCurrencyInfo,
  getSupportedCurrencies,
  clearCache,
  CurrencyConverter,
  CurrencyError,
} from './index.js';

async function runTests() {
  console.log('🧪 Starting tests for @itsriteshx/currency-converter...\n');

  // Test 1: Same currency conversion (instant zero API call)
  console.log('1. Testing same currency conversion...');
  const same = await convertCurrency('USD', 'USD', 150);
  assert.strictEqual(same, 150, 'Same currency should return exact amount');
  console.log('   ✅ Same currency: 150 USD -> 150 USD');

  // Test 2: Input validation
  console.log('2. Testing input validation and sanitization...');
  try {
    await convertCurrency('INVALID_CODE', 'USD', 100);
    assert.fail('Should throw for invalid currency code');
  } catch (err) {
    assert.ok(err instanceof CurrencyError, 'Should throw CurrencyError');
    assert.strictEqual(err.code, 'INVALID_CURRENCY_CODE');
    console.log('   ✅ Rejected invalid currency code successfully');
  }

  try {
    await convertCurrency('USD', 'EUR', -50);
    assert.fail('Should throw for negative amount');
  } catch (err) {
    assert.ok(err instanceof CurrencyError, 'Should throw CurrencyError');
    assert.strictEqual(err.code, 'INVALID_AMOUNT');
    console.log('   ✅ Rejected negative amount successfully');
  }

  // Test 3: Currency Formatter
  console.log('3. Testing formatCurrency...');
  const usdFormatted = formatCurrency(1234.56, 'USD', 'en-US');
  assert.ok(usdFormatted.includes('$') || usdFormatted.includes('USD'), 'Should format USD');
  console.log(`   ✅ USD formatted: ${usdFormatted}`);

  const inrFormatted = formatCurrency(9329.54, 'INR', 'en-IN');
  assert.ok(inrFormatted.includes('₹') || inrFormatted.includes('INR'), 'Should format INR');
  console.log(`   ✅ INR formatted: ${inrFormatted}`);

  // Test 4: Currency Metadata
  console.log('4. Testing getCurrencyInfo & getSupportedCurrencies...');
  const inrInfo = getCurrencyInfo('inr'); // test lowercase auto-sanitize
  assert.strictEqual(inrInfo.code, 'INR');
  assert.strictEqual(inrInfo.symbol, '₹');
  console.log(`   ✅ Metadata for INR: ${inrInfo.flag} ${inrInfo.name} (${inrInfo.symbol})`);

  const allSupported = getSupportedCurrencies();
  assert.ok(allSupported.length >= 10, 'Should support at least 10 currencies');
  console.log(`   ✅ Supported currencies count: ${allSupported.length}`);

  // Test 5: Live API conversion & In-memory cache test
  console.log('5. Testing live conversion & caching speed...');
  clearCache();

  const start1 = Date.now();
  const rate1 = await convertCurrency('usd', 'eur', 100); // test lowercase auto-sanitize
  const duration1 = Date.now() - start1;
  assert.ok(typeof rate1 === 'number' && rate1 > 0, 'Should return positive number');
  console.log(`   ✅ First call (Network fetch): 100 USD = ${rate1.toFixed(2)} EUR (${duration1}ms)`);

  const start2 = Date.now();
  const rate2 = await convertCurrency('USD', 'EUR', 100);
  const duration2 = Date.now() - start2;
  assert.strictEqual(rate1, rate2, 'Cached value must match network value');
  assert.ok(duration2 < 50, 'Cached call should be ultra-fast (<50ms)');
  console.log(`   ⚡ Second call (Memory Cache): 100 USD = ${rate2.toFixed(2)} EUR (${duration2}ms)`);

  // Test 6: Multi-currency conversion
  console.log('6. Testing convertMany (Batch conversion)...');
  const manyResults = await convertMany('USD', ['EUR', 'INR'], 50);
  assert.ok(manyResults.EUR > 0, 'EUR should be converted');
  assert.ok(manyResults.INR > 0, 'INR should be converted');
  console.log(`   ✅ convertMany(50 USD): EUR = ${manyResults.EUR.toFixed(2)}, INR = ${manyResults.INR.toFixed(2)}`);

  // Test 7: CurrencyConverter Class
  console.log('7. Testing CurrencyConverter class instance...');
  const client = new CurrencyConverter({ useCache: true });
  const classResult = await client.convert('USD', 'INR', 10);
  assert.ok(classResult > 0);
  console.log(`   ✅ Client instance conversion: 10 USD = ₹${classResult.toFixed(2)}`);

  console.log('\n🎉 ALL 7 TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
