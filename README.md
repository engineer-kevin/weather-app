# 天气预报 | Weather App

一个以 **Next.js（App Router）+ TypeScript** 打造的天气应用：搜索地点后即可查看当前天气、未来 24 小时逐时预报与未来 7 天预报。天气数据来自 [Open-Meteo](https://open-meteo.com/)——免费、免注册、**免 API Key**，因此 clone 后不需要任何环境配置即可运行。

## 功能

- **地点搜索**：输入至少 2 个字符后自动查询（300ms debounce），下拉菜单支持键盘上下键导航、Enter 选取、Esc 关闭
- **当前天气**：温度、体感、湿度、风速、降雨概率；卡片背景渐变色随天气与昼夜变化
- **未来 24 小时**：横向滚动的逐时温度与天气图标（日/夜图标自动切换）
- **未来 7 天**：每日天气、降雨概率、温度区间可视化长条
- **状态处理**：各区块均有骨架屏（Loading）、可重试的错误卡片（Error）、搜索无结果与未选地点的空状态（Empty）
- **最近搜索**：记录最近 5 条地点（localStorage），跨标签页同步

## 快速开始

```bash
npm install
npm run dev        # 开发模式 → http://localhost:3000
npm run build      # 生产构建
```

无需 `.env` 或任何 API Key。

## 技术栈

| 分类 | 选择 |
| --- | --- |
| 框架 | Next.js 16（App Router）、React 19、TypeScript strict |
| 样式 | Tailwind CSS v4 |
| 服务器状态 | TanStack Query v5 |
| 数据来源 | Open-Meteo（Geocoding + Forecast） |

## 架构总览

```text
app/
  layout.tsx        根布局（字体、metadata、Providers）
  providers.tsx     QueryClientProvider（唯一的全局 client boundary）
  page.tsx          server component，仅负责 <Suspense> 包裹
  globals.css
components/
  home.tsx          主页 client island：读 URL 参数、组装所有区块
  search-bar.tsx    搜索 + debounce + 自动完成下拉 + 键盘导航
  current-weather-card.tsx / hourly-forecast.tsx / daily-forecast.tsx
  weather-icon.tsx  WMO code → inline SVG 图标（零依赖、支持昼夜）
  recent-searches.tsx / skeletons.tsx / error-state.tsx
hooks/
  use-location-search.ts   地点搜索 Query（debounce、≥2 字符才启用）
  use-weather.ts           天气 Query（keyed by 经纬度、staleTime 10 分钟）
  use-recent-searches.ts   localStorage 外部 store（useSyncExternalStore）
lib/
  api.ts            唯一的 HTTP 出口：统一超时（10s）、错误转译为 ApiError
  types.ts          API 响应与领域模型类型
  weather-codes.ts  WMO weather code → 中文描述 / 图标种类 / 渐变主题
```

### 数据流

```text
SearchBar 输入 → debounce 300ms → useLocationSearch（TanStack Query）→ 下拉候选
点选候选 → router.replace("/?lat=&lon=&name=…")   ← URL 是「选中地点」的唯一事实来源
        → useWeather（TanStack Query）→ 当前天气 / 24 小时 / 7 天
```

## 设计决策与取舍

### 1. 状态三分法：服务器状态、URL 状态、本地 UI 状态

- **服务器状态**（搜索结果、天气数据）交给 TanStack Query：缓存、请求去重、重试、`staleTime`（天气 10 分钟、地点 5 分钟）都是声明式配置，避免手写 loading/error 样板。
- **选中地点放在 URL query**（`?lat=&lon=&name=`）而不是 state：链接可直接分享、刷新不丢失、浏览器前进后退自然可用。`components/home.tsx` 是唯一读写它的地方。
- **搜索框输入值、下拉开合**留在组件内 `useState`；**最近搜索**用 `useSyncExternalStore` 包装 localStorage（React 19 读取外部 store 的标准做法，天然处理 SSR 水合与跨标签页同步）。
- **刻意不引入 Redux/Zustand**：本应用没有跨组件共享的复杂客户端状态，全局 store 只会增加概念负担——这是有意识的取舍。

### 2. 为何选 Open-Meteo

- 免 API Key，评测者 clone 后 `npm run dev` 即可运行，零配置。
- 一个来源同时提供地点搜索（Geocoding）与天气（Forecast），接口一致、皆为 JSON。
- 取舍：**中文地名覆盖率不稳定**（例如「东京」可搜到、「台北」搜不到；英文查询皆正常）。这是上游数据（GeoNames）的限制。处理方式：无结果时明确提示「试试英文地名」，而非静默失败。

### 3. 为何 client-side 取数据，而非 Route Handler 代理

Open-Meteo 公开 CORS、无密钥，直接从浏览器请求最简单，也少一跳延迟。若未来换成需要密钥的 API（如 OpenWeatherMap），只需在 `lib/api.ts` 对应一个 Route Handler 隐藏密钥——API 逻辑已被收敛在单一文件，改动不会外溢。

### 4. 错误处理策略

- `lib/api.ts` 是唯一的 HTTP 出口：10 秒超时（`AbortSignal.timeout`）、非 2xx、超时、网络错误都转译成**带用户可读信息的 `ApiError`**，UI 直接显示 `error.message`，不用各处自行判断。
- 每个数据区块都有对应骨架屏；天气加载失败显示可重试卡片（Query `refetch`）；搜索无结果与未选地点分别有清楚的空状态。
- 最近搜索的 localStorage 读写全部 try/catch：隐私模式下降级为「不持久化」，功能不受影响。

### 5. 组件设计

- 天气图标是**手写 inline SVG**（`weather-icon.tsx`）：零依赖、单色 `currentColor` 随场景着色、以「图标种类」为抽象层——UI 不认得 WMO 原始代码，只认得 `clear / rain / snow…` 十种语义种类（`lib/weather-codes.ts` 集中映射，新增天气只需改一处）。
- 时间显示刻意**解析字符串**而非 `new Date(iso)`：Open-Meteo 返回的是「地点当地时间」（无时区后缀），直接建 `Date` 会被浏览器时区错误转换；仅「星期几」用 `Date`（以日期分量构造，无偏移问题）。

## 已知限制与未来改进

- 单位固定为 °C / km/h，无单位切换
- 无多语言（UI 为简体中文）、无暗色模式
- 未使用浏览器 Geolocation 自动定位
- 测试：目前以 build/lint/手动验证把关，可补上 Vitest + Testing Library（hooks 与 weather-codes 映射非常适合单元测试）
