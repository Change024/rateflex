// EXPORTS: calculateResult, formatNumber, formatCurrency, convertCurrency, getCurrencySymbol

import type {
  CalculatorState,
  CalculationResult,
  CurrencyCode,
  QuoteMode,
} from '@/data/calculator';
import { MODE_INFO, CURRENCIES } from '@/data/calculator';

/**
 * 币种转换：以美元(USD)为基准货币
 * @param amount 金额
 * @param from 源币种
 * @param to 目标币种
 * @param rates 汇率表（1 USD = ? 该货币）
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>,
): number {
  if (from === to) return amount;
  // 先转成美元（基准币），再转目标币种
  const usdAmount = from === 'USD' ? amount : amount / rates[from];
  if (to === 'USD') return usdAmount;
  return usdAmount * rates[to];
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '';
}

/**
 * 核心计算函数
 * 严格按照Excel公式实现，所有内部计算以USD为基准：
 *
 * 香港未税（无系数）：
 *   正向：供应商TP(USD) = (销售报价(USD) × 数量 - 运费(USD)) ÷ 数量 ÷ 利润率系数
 *   反向：销售报价(USD) = (供应商TP(USD) × 数量 × 利润率系数 + 运费(USD)) ÷ 数量
 *
 * 深圳含税/未税（有系数）：
 *   正向：
 *     销售报价(USD未税) = 销售报价(CNY含税) ÷ 系数 ÷ 汇率
 *     供应商TP(USD) = (销售报价(USD未税) × 数量 - 运费(USD)) ÷ 数量 ÷ 利润率系数
 *   反向：
 *     销售报价(USD未税) = (供应商TP(USD) × 数量 × 利润率系数 + 运费(USD)) ÷ 数量
 *     销售报价(CNY含税) = 销售报价(USD未税) × 系数 × 汇率
 *
 * 利润 = 销售总额(未税USD) - 总成本(USD)
 * 利润率 = 利润 ÷ 销售总额(未税USD) × 100%
 *
 * 注：系数 = 1 + 税率（如13%增值税 → 系数=1.13）
 *     含税价 = 未税价 × 系数
 */
export function calculateResult(state: CalculatorState): CalculationResult {
  const {
    mode,
    calcDirection,
    saleCurrency,
    tpCurrency,
    freightCurrency,
    exchangeRates,
    salePrice,
    quantity,
    freightCost,
    freightQuantity,
    coefficient,
    profitRate,
    supplierTp,
  } = state;

  const qty = Math.max(quantity, 0);
  const fqty = Math.max(freightQuantity, 0);
  const modeInfo = MODE_INFO[mode];

  // 运费转成美元（内部计算基准）
  const freightCostUsd = convertCurrency(
    freightCost,
    freightCurrency,
    'USD',
    exchangeRates,
  );
  const freightPerUnitUsd = fqty > 0 ? freightCostUsd / fqty : 0;

  if (calcDirection === 'forward') {
    // ===== 正向：销售报价 → 供应商TP =====

    // 第一步：销售报价转成美元
    let salePriceUsdUntaxed = convertCurrency(
      salePrice,
      saleCurrency,
      'USD',
      exchangeRates,
    );

    // 第二步：如果是含税模式，先除以系数得到未税价（美元）
    // 含税价(CNY) → 未税价(CNY) = 含税价 ÷ 系数 → 未税价(USD) = 未税价(CNY) ÷ 汇率
    // 等价于：未税价(USD) = 含税价(USD) ÷ 系数
    if (modeInfo.hasTaxRate && coefficient > 0) {
      salePriceUsdUntaxed = salePriceUsdUntaxed / coefficient;
    }

    const saleTotalUsd = salePriceUsdUntaxed * qty;
    const saleTotalQuote = salePrice * qty; // 销售币种的总价

    // 第三步：计算供应商TP（美元单价）
    // 公式：TP(USD) = (销售总额USD - 运费USD) ÷ 数量 ÷ 利润率系数
    const tpTotalUsd = saleTotalUsd - freightCostUsd;
    const tpUnitUsd =
      qty > 0 && profitRate > 0 ? tpTotalUsd / qty / profitRate : 0;

    // TP转成目标币种
    const tpUnitTarget = convertCurrency(
      tpUnitUsd,
      'USD',
      tpCurrency,
      exchangeRates,
    );
    const tpTotalTarget = tpUnitTarget * qty;

    // 成本
    const costTotalUsd = tpUnitUsd * qty + freightCostUsd;
    const costPerUnitUsd = qty > 0 ? costTotalUsd / qty : 0;

    // 利润（用未税销售额计算）
    const profitTotalUsd = saleTotalUsd - costTotalUsd;
    const profitPerUnitUsd = qty > 0 ? profitTotalUsd / qty : 0;
    const profitMargin = saleTotalUsd > 0 ? (profitTotalUsd / saleTotalUsd) * 100 : 0;

    // 盈亏平衡单价（销售币种）：利润为0时的报价
    let breakEvenPrice = 0;
    if (qty > 0) {
      let breakEvenUsdPerUnit = tpUnitUsd + freightPerUnitUsd;
      // 含税模式要乘回系数
      if (modeInfo.hasTaxRate) {
        breakEvenUsdPerUnit = breakEvenUsdPerUnit * coefficient;
      }
      breakEvenPrice = convertCurrency(
        breakEvenUsdPerUnit,
        'USD',
        saleCurrency,
        exchangeRates,
      );
    }

    return {
      salePrice,
      saleTotal: saleTotalQuote,
      saleTotalUsd,
      freightPerUnitUsd,
      costPerUnitUsd,
      costTotalUsd,
      profitPerUnitUsd,
      profitTotalUsd,
      profitMargin,
      supplierTp: tpUnitTarget,
      supplierTpUsd: tpUnitUsd,
      supplierTpTotal: tpTotalTarget,
      supplierTpTotalUsd: tpUnitUsd * qty,
      breakEvenPrice,
    };
  } else {
    // ===== 反向：供应商TP → 销售报价 =====

    // 第一步：供应商TP转成美元
    const tpUnitUsd = convertCurrency(
      supplierTp,
      tpCurrency,
      'USD',
      exchangeRates,
    );
    const tpTotalUsd = tpUnitUsd * qty;

    // 第二步：计算未税销售报价（美元单价）
    // 公式：销售价(USD未税) = (TP(USD) × 数量 × 利润率系数 + 运费USD) ÷ 数量
    const saleTotalUsdUntaxed = tpTotalUsd * profitRate + freightCostUsd;
    const salePriceUsdUntaxed = qty > 0 ? saleTotalUsdUntaxed / qty : 0;

    // 第三步：计算含税销售价（如果是含税模式）
    let salePriceUsdForDisplay = salePriceUsdUntaxed;
    if (modeInfo.hasTaxRate) {
      salePriceUsdForDisplay = salePriceUsdUntaxed * coefficient;
    }

    // 销售价转成目标币种
    const salePriceTarget = convertCurrency(
      salePriceUsdForDisplay,
      'USD',
      saleCurrency,
      exchangeRates,
    );
    const saleTotalTarget = salePriceTarget * qty;

    // 成本
    const costTotalUsd = tpTotalUsd + freightCostUsd;
    const costPerUnitUsd = qty > 0 ? costTotalUsd / qty : 0;

    // 利润（用未税销售额计算，与正向一致）
    const profitTotalUsd = saleTotalUsdUntaxed - costTotalUsd;
    const profitPerUnitUsd = qty > 0 ? profitTotalUsd / qty : 0;
    const profitMargin =
      saleTotalUsdUntaxed > 0 ? (profitTotalUsd / saleTotalUsdUntaxed) * 100 : 0;

    // 盈亏平衡单价（销售币种）
    let breakEvenPrice = 0;
    if (qty > 0) {
      let breakEvenUsdPerUnit = tpUnitUsd + freightPerUnitUsd;
      if (modeInfo.hasTaxRate) {
        breakEvenUsdPerUnit = breakEvenUsdPerUnit * coefficient;
      }
      breakEvenPrice = convertCurrency(
        breakEvenUsdPerUnit,
        'USD',
        saleCurrency,
        exchangeRates,
      );
    }

    return {
      salePrice: salePriceTarget,
      saleTotal: saleTotalTarget,
      saleTotalUsd: saleTotalUsdUntaxed,
      freightPerUnitUsd,
      costPerUnitUsd,
      costTotalUsd,
      profitPerUnitUsd,
      profitTotalUsd,
      profitMargin,
      supplierTp,
      supplierTpUsd: tpUnitUsd,
      supplierTpTotal: supplierTp * qty,
      supplierTpTotalUsd: tpTotalUsd,
      breakEvenPrice,
    };
  }
}

export function formatNumber(num: number, decimals = 4): string {
  if (!isFinite(num)) return '0';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  num: number,
  symbol = '$',
  decimals = 4,
): string {
  return `${symbol}${formatNumber(num, decimals)}`;
}
