# RateFlex

RateFlex 是一个面向外贸业务的报价、成本与利润计算工具，由妙搭项目封装为可独立运行和部署的 React 应用。

## 在线使用

打开 [https://change024.github.io/rateflex/](https://change024.github.io/rateflex/) 即可直接使用，无需安装软件。`main` 分支更新后，GitHub Actions 会自动重新部署网站。

## 功能

- 支持正向计算（销售报价 → 供应商 TP）和反向计算（供应商 TP → 销售报价）
- 支持香港未税、深圳含税/未税等贸易模式
- 支持 USD、CNY、HKD、EUR 等币种与自定义汇率
- 自动计算运费、总成本、利润、利润率和盈亏平衡价
- 纯前端运行，不需要后端服务；输入数据不会上传到服务器

## 技术栈

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn/ui + Radix UI

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm ci
npm run dev
```

开发服务器启动后，按终端显示的地址访问应用。

## 检查与构建

```bash
npm run typecheck
npm run lint:eslint
npm run build
npm run preview
```

普通生产构建输出到 `dist/client/`，可部署到任意静态网站托管平台。

如果需要继续使用妙搭平台原有的分目录构建格式，请在 Bash 环境中运行：

```bash
npm run build:miaoda
```

## 项目结构

```text
src/
  data/          计算器类型与默认数据
  lib/calc.ts    核心换算和利润计算逻辑
  pages/         页面与业务组件
  components/    通用 UI 组件
shared/          妙搭静态资源与能力配置
scripts/         开发、构建和 Git hooks 脚本
```

## 部署说明

项目是单页应用。部署时请将构建目录设为 `dist`，并把未知路径回退到 `index.html`。当前版本不依赖环境变量或外部 API。当然，可以下载code后，下载node.js，然后power shell输入：cd D:\rateflex
npm install
npm run dev
生成一个网址，就可以本地使用
## 数据说明

默认汇率仅用于计算演示。实际业务使用前，请按当日结算汇率更新页面中的汇率值，并自行复核税率、费用与贸易条款。
