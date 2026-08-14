需求文档生成失败

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Structural Reference —— Excel 工具提供字段结构、计算逻辑与模块划分，视觉风格按 Web 工具重建
- **核心情绪 / 应用类型**: 外贸从业者日常使用的专业计算工具，需要快速输入、实时反馈、数据可信、一眼看清利润
- **独特记忆点**: 贸易术语切换时费用项联动高亮/灰化的"动态成本地图"，以及利润结果区用蓝色渐变卡片突出的"利润仪表盘"

## 2. Art Direction

- **方向名**: 商务蓝调精密计算
- **Design Style**: Swiss Minimalist 瑞士极简 + Light Grid 轻网格 —— 表格化布局天然契合外贸计算场景，蓝色主色传递专业可信，细线网格强化数据秩序
- **DNA 参数**: 圆角 subtle (rounded-md) / 阴影 subtle (shadow-sm) / 间距 standard (gap-4 / p-6) / 字体方向 清晰无衬线 + 数据等宽 / 装饰手法 细边框分组 + 顶部色条模块标识
- **应用类型**: Tool —— 左侧/上方输入区 + 右侧/下方实时结果面板的双栏布局

## 3. Color System

**色彩关系**: 深海蓝主色 + 极浅蓝反馈底 + 纯白卡片背景 + 冷灰文字层次，利润数据用同色系高亮蓝突出
**配色设计理由**: 蓝色系传递金融/贸易的专业与信任感，纯白背景确保大量数字输入的可读性，利润高亮用更深更饱和的蓝色在克制中制造视觉焦点，避免使用刺眼的红绿对比
**主色推导**: 从外贸/金融行业的信任语义出发，选取 HSL 215° 附近的蓝色作为主色锚点，通过明度阶梯衍生出按钮、链接、选中态、边框等角色
**使用比例**: 65% 中性（白+冷灰）/ 28% 辅助浅蓝 / 7% primary 深蓝；primary 仅用于主按钮、关键结果数字、贸易术语激活态

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(214 32% 97%) | 页面背景，极浅蓝灰，区分卡片 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片、表单、结果面板 |
| text | `--foreground` | `text-foreground` | hsl(217 33% 17%) | 标题与正文，深墨蓝灰 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 16% 47%) | 说明文字、单位、辅助标签 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(218 88% 48%) | 主按钮、利润高亮、贸易术语激活、品牌锚点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的文字与图标 |
| accent | `--accent` | `bg-accent` | hsl(214 67% 95%) | hover/focus 浅底、选中行、费用分组头底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(218 88% 48%) | accent 上的文字与图标 |
| border | `--border` | `border-border` | hsl(214 20% 88%) | 输入框、表格线、卡片边界 |

**语义色提示**: 成功（盈利正增长）hsl(152 60% 35%)，三态 bg: hsl(152 56% 95%) / border: hsl(152 45% 80%) / text: hsl(152 60% 32%)；警告（利润率偏低）hsl(38 92% 50%)，三态 bg: hsl(48 95% 95%) / border: hsl(40 90% 80%) / text: hsl(32 95% 40%)；错误（输入无效/亏损）hsl(0 84% 55%)，三态 bg: hsl(0 86% 97%) / border: hsl(0 80% 85%) / text: hsl(0 80% 45%)；所有语义色饱和度与 primary 对齐 ±10%，避免状态色压过主品牌

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 中文界面清晰专业，数字与字母形态均衡，适合数据密集工具
- **font-body**: Noto Sans SC + IBM Plex Mono（数字字段） —— 正文用无衬线保证阅读效率，金额、汇率、利润等数字字段用等宽字体强化数据感与对齐
- **字号**: H1 text-2xl ~ text-3xl（工具标题）；H2 text-lg ~ text-xl（模块标题）；body text-sm ~ text-base（输入标签与数值）；muted text-xs（说明与单位）
- **圆角**: 小 —— rounded-md 用于卡片与按钮，rounded-sm 用于输入框，保持商务克制感

## 5. 全局布局契约

- **Reference Layout Use**: 从 Excel 参考提取模块顺序（基础信息 → 采购成本 → 费用成本 → 利润计算 → 结果展示），Web 化后改为左输入右结果的双栏布局
- **Page / Section Order**: 顶部工具栏（保存/重置/币别） → 主内容双栏（左：基础信息+采购成本+费用成本+贸易术语+利润计算；右：实时结果面板）
- **Standard Content Zone**: Tool max-w-6xl + `mx-auto`，输入区与结果区在大屏上并排，中等屏以下堆叠
- **Shell / Frame Alignment**: 内容容器与框架同宽，顶部工具栏与内容区共享同一 max-w 约束
- **Padding & Rhythm**: `px-4 md:px-6 py-6 md:py-8`，模块间 `gap-6`，模块内分组 `gap-4`，保持 4px 倍数节奏
- **Full-bleed Zones**: 无全宽区域，所有内容受 Standard Content Zone 约束
- **Local Narrowing**: 结果面板固定右栏宽度约 360px，输入区自适应剩余空间；移动端堆叠后均为全宽
- **Overflow Strategy**: 费用明细表格使用 `overflow-x-auto`，窄屏下可横向滚动查看
- **Flexibility Boundary**: 允许移动端调整卡片内边距和字段排列（从两列变一列）；不允许改变主色、圆角、阴影语言和结果面板的视觉权重

## 6. 视觉与动效

- **装饰**: 细边框分组 + 模块顶部 3px 色条（primary 蓝）+ 极轻网格背景
- **阴影/边界**: 轻 —— 卡片 shadow-sm，结果面板 shadow-md 略重以突出，输入框仅边框无阴影
- **动效**: 克制 —— 数字变化用 150ms 缓动过渡，贸易术语切换时费用项高亮/灰化用 200ms 透明度变化，hover 状态 100ms 快反馈，无入场动画

## 7. 组件原则

- 输入框统一左标签右数值，右侧带币种/单位后缀，focus 时边框变 primary 且有 2px ring
- 贸易术语用 Segmented Control（分段按钮），激活态为 primary 实底，其余为 outline
- 费用分组用 Collapsible 卡片，头部显示分类名称与该分类小计，展开后显示明细项
- 结果面板用蓝色渐变顶部条 + 白色卡身，利润金额与利润率用大号等宽字体 + primary 色
- 按钮、输入、下拉菜单必须有 Default / Hover / Active / Focus-visible / Disabled 五态
- 保存/重置等次级操作用 outline 或 ghost 样式，主计算/导出用 primary 实底

## 8. Image Direction

- **Image Role**: 无
- **Image Art Direction**: 无强制图片需求，优先通过排版、色彩和数据可视化建立视觉记忆点
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 避免通用商务握手图、地球仪+航线素材图、无意义蓝色渐变背景图

## 9. Anti-patterns

- **Excel 复刻陷阱**: 把 Web 工具做成像素级 Excel 表格，用密集单元格铺满屏幕；应保留计算逻辑，用卡片分组和留白提升可读性
- **利润红绿色盲**: 盈利全绿亏损全红，纯颜色传递状态；必须同时用箭头方向、文字说明和形状区分
- **Primary 泛滥**: 主按钮、tab 激活、icon、边框、链接、表格表头全用蓝色主色；按 65-28-7 比例把 primary 收回到 CTA 和关键结果
- **数字狂欢**: 所有数字都放大加粗，失去层级；只有利润金额、利润率、总成本三个核心数据用大号+主色，其余保持常规
- **术语切换无感**: 切换 EXW/FOB/CIF 时费用项无视觉反馈；必须联动高亮相关费用、灰化不适用项，并给出简短说明
- **状态色刺眼**: 成功/警告/错误用高饱和纯色，与主色克制感脱节；语义色饱和度与 primary 对齐 ±10%