export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ConvertOptions {
  apiKey?: string;
  useCache?: boolean;
  cacheTTL?: number;
}

export interface ConfigureOptions {
  apiKey?: string;
  cacheTTL?: number;
  useCache?: boolean;
}

export declare class CurrencyError extends Error {
  code: string;
  constructor(message: string, code?: string);
}

export declare const CURRENCY_METADATA: Record<string, CurrencyMetadata>;

export declare function configure(options?: ConfigureOptions): void;

export declare function clearCache(): void;

export declare function convertCurrency(
  fromCurrency: string,
  toCurrency: string,
  units?: number,
  options?: ConvertOptions
): Promise<number>;

export declare function convertMany(
  fromCurrency: string,
  toCurrencies: string[],
  units?: number,
  options?: ConvertOptions
): Promise<Record<string, number | null>>;

export declare function getRates(
  baseCurrency?: string,
  options?: ConvertOptions
): Promise<Record<string, number>>;

export declare function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
  formatOptions?: Intl.NumberFormatOptions
): string;

export declare function getCurrencyInfo(currencyCode: string): CurrencyMetadata;

export declare function getSupportedCurrencies(): CurrencyMetadata[];

export declare class CurrencyConverter {
  apiKey: string;
  cacheTTL: number;
  useCache: boolean;

  constructor(options?: ConvertOptions);

  convert(
    fromCurrency: string,
    toCurrency: string,
    units?: number
  ): Promise<number>;

  convertMany(
    fromCurrency: string,
    toCurrencies: string[],
    units?: number
  ): Promise<Record<string, number | null>>;

  getRates(baseCurrency?: string): Promise<Record<string, number>>;

  format(
    amount: number,
    currency?: string,
    locale?: string,
    formatOptions?: Intl.NumberFormatOptions
  ): string;

  clearCache(): void;
}

declare const _default: {
  convertCurrency: typeof convertCurrency;
  convertMany: typeof convertMany;
  getRates: typeof getRates;
  formatCurrency: typeof formatCurrency;
  getCurrencyInfo: typeof getCurrencyInfo;
  getSupportedCurrencies: typeof getSupportedCurrencies;
  configure: typeof configure;
  clearCache: typeof clearCache;
  CurrencyConverter: typeof CurrencyConverter;
  CurrencyError: typeof CurrencyError;
  CURRENCY_METADATA: typeof CURRENCY_METADATA;
};

export default _default;
