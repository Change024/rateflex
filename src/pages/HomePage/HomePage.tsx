import { memo } from 'react';
import { Calculator, Save, RotateCcw, ArrowRightLeft, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { CalculatorState, CurrencyCode, QuoteMode } from '@/data/calculator';
import { CURRENCIES, MODE_INFO } from '@/data/calculator';
import { calculateResult, formatNumber, getCurrencySymbol } from '@/lib/calc';

interface CalculatorPageProps {
  state: CalculatorState;
  onUpdate: (patch: Partial<CalculatorState>) => void;
  onSave: () => void;
  onReset: () => void;
}

function CalculatorPage({ state, onUpdate, onSave, onReset }: CalculatorPageProps) {
  const result = calculateResult(state);
  const modeInfo = MODE_INFO[state.mode];
  const isForward = state.calcDirection === 'forward';

  const saleSymbol = getCurrencySymbol(state.saleCurrency);
  const tpSymbol = getCurrencySymbol(state.tpCurrency);
  const freightSymbol = getCurrencySymbol(state.freightCurrency);

  const handleModeChange = (mode: string) => {
    const newMode = mode as QuoteMode;
    const info = MODE_INFO[newMode];
    let newCoeff = state.coefficient;
    if (newMode === 'shenzhen-tax') {
      newCoeff = 1.13;
    } else if (newMode === 'shenzhen-notax') {
      newCoeff = 1.05;
    }
    onUpdate({
      mode: newMode,
      coefficient: newCoeff,
      saleCurrency: info.defaultSaleCurrency,
      tpCurrency: info.defaultTpCurrency,
    });
  };

  const updateExchangeRate = (currency: CurrencyCode, value: number) => {
    onUpdate({
      exchangeRates: { ...state.exchangeRates, [currency]: value },
    });
  };

  const isProfit = result.profitTotalUsd >= 0;

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      {/* 纸张杂点纹理 */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 顶部栏 */}
      <header className="sticky top-0 z-40 w-full border-b border-foreground/10 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center border border-foreground bg-foreground text-background">
              <Calculator className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                外贸报价利润计算器
              </h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                TP CALCULATOR · HONGKONG / SHENZHEN
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="h-10 rounded-none border-foreground px-6 text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background"
            >
              <Save className="mr-2 size-3.5" />
              保存参数
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 rounded-none border-foreground px-6 text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background"
            >
              <RotateCcw className="mr-2 size-3.5" />
              重置
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-16">
        {/* 页面标题 */}
        <div className="mb-12 border-b border-foreground/10 pb-8">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            PROFIT CALCULATION TOOL
          </p>
          <h2 className="text-5xl font-bold leading-[0.9] tracking-tight text-foreground md:text-6xl">
            报价利润
            <br />
            <span className="text-primary">精密计算</span>
          </h2>
        </div>

        {/* 模式切换 */}
        <div className="mb-10">
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            贸易模式 / TRADE MODE
          </p>
          <Tabs
            value={state.mode}
            onValueChange={handleModeChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 rounded-none border border-foreground/20 bg-transparent p-0">
              {Object.values(MODE_INFO).map((m) => (
                <TabsTrigger
                  key={m.code}
                  value={m.code}
                  className="h-12 rounded-none border-r border-foreground/20 text-xs uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground last:border-r-0"
                >
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.values(MODE_INFO).map((m) => (
              <TabsContent key={m.code} value={m.code} className="mt-0">
                <div className="border-l-2 border-primary bg-muted/30 px-4 py-3">
                  <div className="text-sm font-medium text-foreground">
                    {m.label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {m.description}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* 左侧：输入区 */}
          <div className="space-y-10 lg:col-span-3">
            {/* 计算方向切换 */}
            <div className="border-t border-foreground pt-6">
              <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                计算方向 / CALCULATION DIRECTION
              </p>
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm transition-colors duration-300 ${
                    isForward
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  销售报价 → 供应商TP
                </span>
                <div className="relative">
                  <Switch
                    checked={!isForward}
                    onCheckedChange={(v) =>
                      onUpdate({ calcDirection: v ? 'reverse' : 'forward' })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    !isForward
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  供应商TP → 销售报价
                </span>
              </div>
            </div>

            {/* 主输入区 */}
            <div className="border-t border-foreground pt-6">
              <div className="mb-6 flex items-center gap-3">
                <ArrowRightLeft className="size-4 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {isForward ? '销售报价输入 / SALE PRICE' : '供应商TP输入 / SUPPLIER TP'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isForward ? '销售单价 / Unit Price' : '供应商TP单价 / TP Unit Price'}
                  </Label>
                  <div className="flex items-stretch gap-0">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                        {isForward ? saleSymbol : tpSymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={isForward ? state.salePrice || '' : state.supplierTp || ''}
                        onChange={(e) =>
                          isForward
                            ? onUpdate({ salePrice: parseFloat(e.target.value) || 0 })
                            : onUpdate({ supplierTp: parseFloat(e.target.value) || 0 })
                        }
                        placeholder={`请输入${isForward ? '销售' : 'TP'}单价`}
                        className="h-14 rounded-none border-0 border-b border-foreground bg-transparent pl-10 text-2xl font-bold tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                      />
                    </div>
                    <Select
                      value={isForward ? state.saleCurrency : state.tpCurrency}
                      onValueChange={(v) =>
                        isForward
                          ? onUpdate({ saleCurrency: v as CurrencyCode })
                          : onUpdate({ tpCurrency: v as CurrencyCode })
                      }
                    >
                      <SelectTrigger className="h-14 w-[120px] shrink-0 rounded-none border-0 border-b border-foreground bg-transparent text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-foreground/20">
                        {CURRENCIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="rounded-none text-sm focus:bg-primary focus:text-primary-foreground"
                          >
                            <span className="mr-2 text-muted-foreground">{c.symbol}</span>
                            {c.code}
                            <span className="ml-2 text-xs text-muted-foreground">{c.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      销售数量 / Quantity
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={state.quantity || ''}
                      onChange={(e) =>
                        onUpdate({ quantity: parseInt(e.target.value) || 0 })
                      }
                      placeholder="数量"
                      className="h-12 rounded-none border-0 border-b border-foreground bg-transparent text-lg tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      总金额 / Total
                    </Label>
                    <div className="flex h-12 items-center border-b border-foreground/30 bg-transparent text-lg font-medium tabular-nums text-foreground">
                      {isForward ? saleSymbol : tpSymbol}{' '}
                      {formatNumber(
                        isForward
                          ? state.salePrice * state.quantity
                          : result.supplierTpTotal,
                        4,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 运费成本 */}
            <div className="border-t border-foreground pt-6">
              <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                运费成本 / FREIGHT COST
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    运费成本 / Freight
                  </Label>
                  <div className="flex items-stretch gap-0">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                        {freightSymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={state.freightCost || ''}
                        onChange={(e) =>
                          onUpdate({
                            freightCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="总运费"
                        className="h-12 rounded-none border-0 border-b border-foreground bg-transparent pl-10 text-lg tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                      />
                    </div>
                    <Select
                      value={state.freightCurrency}
                      onValueChange={(v) =>
                        onUpdate({ freightCurrency: v as CurrencyCode })
                      }
                    >
                      <SelectTrigger className="h-12 w-[120px] shrink-0 rounded-none border-0 border-b border-foreground bg-transparent text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-foreground/20">
                        {CURRENCIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="rounded-none text-sm focus:bg-primary focus:text-primary-foreground"
                          >
                            <span className="mr-2 text-muted-foreground">{c.symbol}</span>
                            {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    分摊数量 / Allocation Qty
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={state.freightQuantity || ''}
                    onChange={(e) =>
                      onUpdate({
                        freightQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="分摊数量"
                    className="h-12 rounded-none border-0 border-b border-foreground bg-transparent text-lg tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-l-2 border-primary bg-muted/30 px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  单位运费
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  $ {formatNumber(result.freightPerUnitUsd, 4)} / 件
                </span>
              </div>
            </div>

            {/* 系数与汇率 */}
            <div className="border-t border-foreground pt-6">
              <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                系数与汇率 / COEFFICIENT & EXCHANGE RATE
              </p>

              {modeInfo.hasTaxRate && (
                <div className="mb-6 grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      {state.mode === 'shenzhen-tax'
                        ? '增值税系数 / Tax Rate'
                        : '未税系数 / Coefficient'}
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={state.coefficient || ''}
                      onChange={(e) =>
                        onUpdate({
                          coefficient: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder={
                        state.mode === 'shenzhen-tax' ? '1.13' : '1.05'
                      }
                      className="h-12 rounded-none border-0 border-b border-foreground bg-transparent text-lg tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {state.mode === 'shenzhen-tax'
                        ? '增值税系数，默认 1.13（13%税率）'
                        : '未税系数，默认 1.05'}
                    </p>
                  </div>
                </div>
              )}

              {/* 汇率设置 */}
              <Accordion
                type="single"
                collapsible
                defaultValue="rates"
                className="w-full"
              >
                <AccordionItem value="rates" className="border-0">
                  <AccordionTrigger className="flex items-center gap-2 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:no-underline">
                    <Settings2 className="size-3.5" />
                    汇率设置 / EXCHANGE RATES (基准 USD)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4 pt-3 sm:grid-cols-3">
                      {CURRENCIES.filter((c) => c.code !== 'USD').map((c) => (
                        <div key={c.code} className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                            {c.code} · {c.name}
                          </Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {c.symbol}
                            </span>
                            <Input
                              type="number"
                              step="0.0001"
                              min="0"
                              value={state.exchangeRates[c.code] || ''}
                              onChange={(e) =>
                                updateExchangeRate(
                                  c.code,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="h-10 rounded-none border-0 border-b border-foreground bg-transparent pl-7 text-sm tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* 利润率 */}
            <div className="border-t border-foreground pt-6">
              <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                利润率 / PROFIT MARGIN
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    利润率系数 / Profit Rate Coefficient
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={state.profitRate || ''}
                    onChange={(e) =>
                      onUpdate({
                        profitRate: parseFloat(e.target.value) || 1,
                      })
                    }
                    placeholder="1.1"
                    className="h-12 rounded-none border-0 border-b border-foreground bg-transparent text-lg tabular-nums text-foreground focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    对应利润率 / Equivalent Margin
                  </Label>
                  <div className="flex h-12 items-center border-b border-foreground/30 text-lg font-medium tabular-nums text-foreground">
                    {formatNumber((state.profitRate - 1) * 100, 2)} %
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                  {[1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => onUpdate({ profitRate: r })}
                    className={`h-8 px-4 text-[10px] uppercase tracking-[0.15em] border transition-all duration-300 ${
                      state.profitRate === r
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground hover:text-background'
                    }`}
                  >
                    {Math.round((r - 1) * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：结果面板 */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-8">
              {/* 核心结果卡片 */}
              <div className="border-t-2 border-primary">
                <div className="border-x border-b border-foreground/20 bg-card/50 p-6 backdrop-blur-sm">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {isForward ? '供应商TP / SUPPLIER TP' : '销售报价 / SALE PRICE'}
                  </p>
                  <div className="text-5xl font-bold leading-none tracking-tight tabular-nums text-foreground md:text-6xl">
                    {isForward ? tpSymbol : saleSymbol}
                    <span className="text-primary">
                      {formatNumber(
                        isForward ? result.supplierTp : result.salePrice,
                        4,
                      )}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    总价 {isForward ? tpSymbol : saleSymbol}{' '}
                    {formatNumber(
                      isForward ? result.supplierTpTotal : result.saleTotal,
                      2,
                    )}
                    <span className="ml-2 text-xs">
                      （{isForward ? state.tpCurrency : state.saleCurrency}）
                    </span>
                  </div>
                </div>
              </div>

              {/* 利润指标 */}
              <div className="grid grid-cols-2 gap-0 border-t border-foreground">
                <div className="border-r border-foreground/20 pb-4 pt-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    总利润 / Total Profit
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold tabular-nums ${
                      isProfit ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    $ {formatNumber(result.profitTotalUsd, 2)}
                  </p>
                </div>
                <div className="pb-4 pt-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    利润率 / Margin
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold tabular-nums ${
                      isProfit ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    {formatNumber(result.profitMargin, 2)}%
                  </p>
                </div>
              </div>

              {/* 销售端明细 */}
              <div className="border-t border-foreground">
                <p className="mb-4 pt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  销售端 / SALE SIDE
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                    <span className="text-sm text-muted-foreground">
                      销售总价（{state.saleCurrency}）
                    </span>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {saleSymbol} {formatNumber(result.saleTotal, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                    <span className="text-sm text-muted-foreground">
                      销售总价（USD）
                    </span>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      $ {formatNumber(result.saleTotalUsd, 2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 成本端明细 */}
              <div className="border-t border-foreground">
                <p className="mb-4 pt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  成本端 / COST SIDE (USD)
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                    <span className="text-sm text-muted-foreground">
                      供应商TP总价
                    </span>
                    <span className="text-sm tabular-nums text-foreground">
                      $ {formatNumber(result.supplierTpTotalUsd, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                    <span className="text-sm text-muted-foreground">运费成本</span>
                    <span className="text-sm tabular-nums text-foreground">
                      $ {formatNumber(
                        result.freightPerUnitUsd * state.freightQuantity,
                        2,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-foreground">
                      总成本
                    </span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                      $ {formatNumber(result.costTotalUsd, 2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 盈亏平衡 */}
              <div
                className={`border-l-2 bg-muted/30 p-5 transition-colors duration-300 ${
                  isProfit ? 'border-foreground' : 'border-destructive'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center text-sm font-bold ${
                      isProfit
                        ? 'bg-foreground text-background'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {isProfit ? '✓' : '!'}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold uppercase tracking-wider ${
                        isProfit ? 'text-foreground' : 'text-destructive'
                      }`}
                    >
                      {isProfit ? '盈利状态 / PROFITABLE' : '亏损状态 / LOSS'}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      盈亏平衡单价：
                      <span className="font-medium text-foreground">
                        {saleSymbol}{' '}
                        {formatNumber(result.breakEvenPrice, 4)}
                      </span>
                      <span className="ml-1">（{state.saleCurrency}）</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 公式说明 */}
              <div className="border-t border-foreground/30 pt-6">
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  计算公式 / FORMULA
                </p>
                <div className="space-y-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {state.mode === 'hongkong' && (
                    <>
                      <p>TP(U) = (售价 × 数量 − 运费) ÷ 数量 ÷ 利润率</p>
                      <p>反向：售价 = TP × 利润率 + 运费/数量</p>
                    </>
                  )}
                  {state.mode === 'shenzhen-tax' && (
                    <>
                      <p>TP(U) = (售价 ÷ 税率 ÷ 汇率 × 数量 − 运费) ÷ 数量 ÷ 利润率</p>
                      <p>反向：售价 = TP × 利润率 × 税率 × 汇率 + 运费分摊 × 税率 × 汇率</p>
                    </>
                  )}
                  {state.mode === 'shenzhen-notax' && (
                    <>
                      <p>TP(U) = (售价 ÷ 系数 ÷ 汇率 × 数量 − 运费) ÷ 数量 ÷ 利润率</p>
                      <p>反向：售价 = TP × 利润率 × 系数 × 汇率 + 运费分摊 × 系数 × 汇率</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <footer className="mt-20 border-t border-foreground/10 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            TRADE PROFIT CALCULATOR · 数据自动保存到本地浏览器
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            汇率和费率仅供参考，实际交易请以银行和货代报价为准
          </p>
        </footer>
      </main>
    </div>
  );
}

export default memo(CalculatorPage);
