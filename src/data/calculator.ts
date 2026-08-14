// EXPORTS: QuoteMode, MODE_INFO, CURRENCIES, DEFAULT_EXCHANGE_RATES, type CalculatorState, type CalculationResult, type CurrencyCode, DEFAULT_STATE

export type QuoteMode = 'hongkong' | 'shenzhen-tax' | 'shenzhen-notax';

export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
];

// 汇率：1 USD = ? 其他货币（以美元为基准）
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CNY: 7.25,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.0,
  HKD: 7.82,
};

export interface ModeInfo {
  code: QuoteMode;
  label: string;
  description: string;
  hasTaxRate: boolean;
  defaultSaleCurrency: CurrencyCode;
  defaultTpCurrency: CurrencyCode;
}

export const MODE_INFO: Record<QuoteMode, ModeInfo> = {
  hongkong: {
    code: 'hongkong',
    label: '香港未税',
    description: '香港交货，不含税',
    hasTaxRate: false,
    defaultSaleCurrency: 'USD',
    defaultTpCurrency: 'USD',
  },
  'shenzhen-tax': {
    code: 'shenzhen-tax',
    label: '深圳含税',
    description: '深圳交货，含增值税（默认系数 1.13）',
    hasTaxRate: true,
    defaultSaleCurrency: 'CNY',
    defaultTpCurrency: 'USD',
  },
  'shenzhen-notax': {
    code: 'shenzhen-notax',
    label: '深圳未税',
    description: '深圳交货，不含税（默认系数 1.05）',
    hasTaxRate: true,
    defaultSaleCurrency: 'CNY',
    defaultTpCurrency: 'USD',
  },
};

export interface CalculatorState {
  // 模式
  mode: QuoteMode;
  calcDirection: 'forward' | 'reverse'; // forward: 报价→TP; reverse: TP→报价

  // 币种
  saleCurrency: CurrencyCode;    // 销售报价币种
  tpCurrency: CurrencyCode;      // 供应商TP币种
  freightCurrency: CurrencyCode; // 运费币种

  // 汇率表（以USD为基准，1 USD = ? 该货币）
  exchangeRates: Record<CurrencyCode, number>;

  // 销售报价
  salePrice: number;        // 销售单价（销售币种）
  quantity: number;         // 销售数量

  // 运费
  freightCost: number;      // 运费成本（运费币种）
  freightQuantity: number;  // 运费分摊数量

  // 系数 / 税率
  coefficient: number;      // 系数（深圳含税=1.13增值税率，深圳未税=1.05等）

  // 利润率
  profitRate: number;       // 利润率系数（如1.1表示10%利润）

  // 供应商TP（反向计算输入）
  supplierTp: number;       // 供应商TP单价（TP币种）
}

export const DEFAULT_STATE: CalculatorState = {
  mode: 'hongkong',
  calcDirection: 'forward',
  saleCurrency: 'USD',
  tpCurrency: 'USD',
  freightCurrency: 'USD',
  exchangeRates: { ...DEFAULT_EXCHANGE_RATES },
  salePrice: 8,
  quantity: 2000,
  freightCost: 200,
  freightQuantity: 2000,
  coefficient: 1.13,
  profitRate: 1.1,
  supplierTp: 0,
};

export interface CalculationResult {
  // 销售端
  salePrice: number;        // 销售单价（销售币种）
  saleTotal: number;        // 销售总金额（销售币种）
  saleTotalUsd: number;     // 销售总金额（美元，内部计算基准）

  // 成本端
  freightPerUnitUsd: number; // 单位运费（美元）
  costPerUnitUsd: number;    // 单位成本（美元）= 供应商TP(USD) + 单位运费(USD)
  costTotalUsd: number;      // 总成本（美元）

  // 利润
  profitPerUnitUsd: number;  // 单位利润（美元）
  profitTotalUsd: number;    // 总利润（美元）
  profitMargin: number;      // 利润率（%）

  // 供应商TP
  supplierTp: number;       // 供应商TP单价（TP币种）
  supplierTpUsd: number;    // 供应商TP单价（美元）
  supplierTpTotal: number;  // 供应商TP总价（TP币种）
  supplierTpTotalUsd: number; // 供应商TP总价（美元）

  // 盈亏平衡
  breakEvenPrice: number;   // 盈亏平衡单价（销售币种）
}
