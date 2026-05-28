# 前端界面重设计计划

## 1. 概述

将现有后台管理系统的视觉语言升级为**现代轻量 SaaS 风格**。以 slate 中性灰为骨架、teal 青绿为交互主色、大量留白与卡片化布局。在保持现有路由、交互流程、API 逻辑完全不变的前提下，增加克制的页面过渡与列表入场动效。

## 2. 设计方案

### 2.1 风格方向：现代轻量 SaaS 风

- **色彩**：冷灰白背景，纯白卡片，非蓝紫主色，文字 slate 色系
- **布局**：窄侧边栏（64px 收起 / 220px 展开），内容区最大宽度 1440px 居中，32px 大间距
- **圆角**：卡片 8px，按钮 6px，标签满圆角
- **阴影**：极淡的多层阴影模拟高度，不用硬边框分隔
- **字体**：加大标题字号差异，使用 Outfit + 系统字体

### 2.2 主色选择：Teal `#0d9488`

- 完全避开蓝紫光谱，不属于任何 AI 产品的典型色系
- 专业、清新、现代，适合通用 SaaS
- 在 Ant Design 的 button、link、tag 上表现干净
- 暗色模式下映射为 `#14b8a6`（更亮的青绿），不刺眼

### 2.3 动效策略：克制（Subtle）

- 仅使用 `opacity` + `translateY` / `scale`，无旋转、弹性、弹跳
- 所有动画时长控制在 0.15s–0.3s
- 面向客户的 SaaS 需要专业感，过于活泼的动效会降低信任度

**具体动效清单**：

| 场景 | 动效 | 时长 | 说明 |
|------|------|------|------|
| 页面切换 | `opacity: 0→1`, `y: 8→0` | 0.2s | ease-out |
| 卡片列表 | staggerChildren 0.05s | 0.2s | 依次淡入 |
| 统计数字 | count-up | 1.5s | 进入视口时触发 |
| Hover 反馈 | `translateY(-2px)` + shadow 加深 | 0.2s | 仅桌面端 |
| 侧边栏 | width 过渡 | 0.3s | ease |
| 弹窗/抽屉 | `scale(0.98→1)` + opacity | 0.15s | - |
| 加载状态 | shimmer skeleton | - | 自定义颜色 |

## 3. 范围

### 3.1 做（In Scope）

- 全局样式（色板、字体、间距、圆角、阴影）
- 布局组件（Sidebar、Header、AppLayout、MobileDrawer）
- 页面级容器样式重塑（Dashboard / UserList / RoleList / MenuList / Profile / Login）
- 路由切换动效
- 通用动效组件封装（PageTransition / FadeIn / CountUp）
- 暗色模式 token 同步调整
- 移动端适配

### 3.2 不做（Out of Scope）

- 不新增功能模块（仍保持用户/角色/菜单/个人资料 4 个管理模块）
- 不改交互流程（表单提交逻辑、弹窗确认、权限判断保持原样）
- 不改后端 API（Dashboard 统计数据由前端聚合现有列表接口）
- 不引入图表库（Dashboard 以统计卡片+列表为主，无折线/柱状图）
- 不做 3D 动效、视频背景、粒子效果等重度动效
- 不改路由定义、Redux 状态结构

## 4. 技术方案

### 4.1 技术栈

- **UI 组件库**：Ant Design 6（保持）
- **路由**：React Router 7（保持）
- **状态管理**：Redux Toolkit（保持）
- **动效库**：`framer-motion` v11（新增唯一依赖）

### 4.2 实现路径

1. **Ant Design ConfigProvider**：批量替换设计 token（`colorPrimary`, `colorBgLayout`, `colorBgContainer`, `borderRadius` 等）
2. **CSS 变量**：`global.css` 统一自定义色值，`[data-theme="dark"]` 下同步映射
3. **Framer Motion**：封装可复用动效组件，接入路由系统
4. **逐页替换**：页面根容器布局重塑，保持内部业务逻辑不变

## 5. 分阶段执行计划

所有阶段独立可合并，每阶段结束后系统均可正常使用。

### Phase 1：全局主题系统（约 0.5 天）

目标：建立新色板、字体、圆角、阴影体系，让打开任意页面都能看到新风格。

**具体改动**：

1. `frontend/package.json` — 安装 `framer-motion`
2. `frontend/src/App.tsx` — 更新 `ConfigProvider` token
   - `colorPrimary: '#0d9488'`
   - `colorBgLayout: '#f8fafc'`
   - `colorBgContainer: '#ffffff'`
   - `borderRadius: 8`
   - 其他必要 token
3. `frontend/src/styles/global.css` — 重写 `:root` CSS 变量
   - `--color-text-primary: #1e293b`
   - `--color-text-secondary: #64748b`
   - `--color-bg-page: #f8fafc`
   - `--color-bg-card: #ffffff`
   - `--color-border: #e2e8f0`
   - `--color-accent: #0d9488`
   - `--color-accent-hover: #0f766e`
   - 补充 `[data-theme="dark"]` 映射
4. `frontend/src/styles/antd.override.css` — 调整按钮、卡片、模态框的圆角和阴影覆盖
5. `frontend/src/modules/theme/slice.ts` — 确保暗色模式切换时 `ConfigProvider` 能动态响应

**验证清单**：
- [ ] 运行 `pnpm dev`，切换 light/dark/system 三种模式，检查侧边栏、按钮、卡片颜色是否正确
- [ ] 检查无硬编码旧色（如 `#c45c3e`）残留在全局样式

---

### Phase 2：布局重塑（约 0.5 天）

目标：侧边栏、顶部栏、内容区骨架符合现代 SaaS 比例。

**具体改动**：

1. `frontend/src/components/layout/AppLayout.tsx`
   - 内容区加 `max-width: 1440px` 居中
   - 背景设 `--color-bg-page`
   - 内边距调大（桌面 32px / 移动 16px）

2. `frontend/src/components/layout/AppLayout.module.css`
   - 更新 flex 布局、padding

3. `frontend/src/components/layout/Sidebar.tsx`
   - 展开宽度 220px，收起宽度 64px
   - Menu 模式保持 `inline`，`collapsedWidth={64}`
   - 精简 Logo 区，图标文字间距调小

4. `frontend/src/components/layout/Sidebar.module.css`
   - 重写过渡动画（width 0.3s ease）
   - 窄栏时的图标居中

5. `frontend/src/components/layout/Header.tsx`
   - 高度保持 64px
   - 去除多余底边框
   - 背景与内容区融合（透明或同背景色）

6. `frontend/src/components/layout/MobileDrawer.tsx`
   - 圆角、阴影适配新风格

**验证清单**：
- [ ] 桌面端：侧边栏收起/展开平滑，图标居中
- [ ] 移动端：抽屉弹出正常，无样式崩坏

---

### Phase 3：动效基础设施（约 0.5 天）

目标：封装可复用动效组件，接入路由系统。

**具体改动**：

1. `frontend/src/components/common/PageTransition.tsx`
   - 用 `framer-motion` 的 `AnimatePresence` + `motion.div` 包裹路由内容
   - 动效：`opacity: 0→1`, `y: 8→0`, `duration: 0.2`, `ease: easeOut`

2. `frontend/src/components/common/FadeIn.tsx`
   - 通用容器，支持 `staggerChildren: 0.05`
   - 子元素依次淡入：`y: 12→0`, `opacity: 0→1`

3. `frontend/src/components/common/CountUp.tsx`
   - 基于 `framer-motion` `useInView` + `useSpring`
   - 数字从 0 滚动到目标值，`duration: 1.5s`

4. `frontend/src/app/routes.tsx`
   - 在 `AuthGuard` 或页面出口处包裹 `<PageTransition />`

**验证清单**：
- [ ] 切换 /dashboard、/users、/roles 等路由，观察页面是否有 fade + slide-up 过渡
- [ ] 无闪烁、无双重渲染、无滚动条抖动

---

### Phase 4：页面级视觉升级（约 1 天）

目标：每个页面从"默认 Ant Design 堆砌"升级为"有信息层级的现代后台"。

#### DashboardPage (`frontend/src/modules/dashboard/pages/DashboardPage.tsx`)

- **顶部**：一排 3 个统计卡片（总用户数 / 总角色数 / 总菜单数），用 `<CountUp />` 动画
  - 数据通过现有 `fetchUsers`、`fetchRoles`、`fetchMenus` 聚合
- **中部**：4 个快捷入口卡片（跳转到用户/角色/菜单/个人资料），带 hover 上浮
- **下部**："最近活动"列表（先用 mock 数据或当前用户信息占位）

#### UserListPage / RoleListPage / MenuListPage

- 页面根容器用 `<FadeIn stagger>` 包裹
- Table 上方加搜索/操作区卡片（白色卡片容器，带阴影）
- Table 行增加 hover 效果（背景色微变 + 左侧 2px teal 竖条指示器，仅 CSS）
- 分页器居中

#### ProfilePage (`frontend/src/modules/auth/pages/ProfilePage.tsx`)

- 改为上下卡片组：
  - 顶部"个人信息概览"卡片（头像+姓名+角色）
  - 底部"编辑资料"表单卡片
- 表单字段分组，增加视觉间距

#### LoginPage (`frontend/src/modules/auth/pages/LoginPage.tsx`)

- 居中精美卡片（最大宽度 420px），大标题 + 副标题
- 输入框大圆角，全宽登录按钮
- 背景用纯色或极淡网格纹理，去除杂乱元素

**验证清单**：
- [ ] Dashboard 统计数字有 count-up 动画
- [ ] 列表页刷新后数据 stagger 入场
- [ ] 各页面在移动端自动垂直堆叠，无横向溢出

---

### Phase 5：细节打磨与暗色适配（约 0.5 天）

目标：消除硬编码颜色、暗色模式一致、移动端完善。

**具体改动**：

1. 全局搜索 `style={{` 和硬编码色值（如 `#333`、`#666`、`#000`、`rgb(...)`），统一替换为 CSS 变量
2. 检查 `src/components/common/` 下的 `PermissionButton`、`ImageUploader` 等，确保按钮/边框色跟随新 token
3. 暗色模式逐项检查：侧边栏、Table 行 hover、Card 阴影、Modal 背景、Input focus ring
4. 移动端触摸反馈：替代 hover 效果（如 active 状态）
5. 删除 Phase 1-4 中产生的未使用导入/变量

**验证清单**：
- [ ] 全局搜索 `#c45c3e`（旧主色），确认无残留（除非故意保留为 error 色）
- [ ] 暗色模式切换后，所有页面无刺眼颜色或丢失背景
- [ ] Lighthouse Performance > 80（关注 CLS 和动画帧率）

## 6. 关键决策与理由

| 决策 | 选择 | 理由 |
|------|------|------|
| 主色 | Teal `#0d9488` | 避开蓝紫（AI 风格），专业清新，暗色模式可映射为 `#14b8a6` |
| Dashboard 数据 | 前端聚合现有 API | 不改后端边界，直接复用 `fetchUsers`/`fetchRoles`/`fetchMenus` 的响应长度 |
| 侧边栏交互 | 保持 click toggle | hover 自动展开需复杂计时逻辑，易与移动端冲突；click toggle 是 Ant Design 原生能力 |
| 动效强度 | 克制 | SaaS 需专业感，动画时长控制在 0.15s–0.3s，无旋转/弹跳 |
| 动效库 | `framer-motion` v11 | 声明式 API 适合 vibe coding，v11 已支持 React 19，不引入 GSAP 等重型库 |

## 7. 回滚策略

- **全局样式**：所有新色值集中在 `global.css` 和 `App.tsx` 的 `ConfigProvider`，回滚只需恢复旧变量和 token。
- **Framer Motion**：仅作为包装组件引入，不影响业务逻辑；若出现兼容问题，删除 `<PageTransition />`、`<FadeIn />` 等组件即可恢复无动效状态。
- **页面布局**：每个页面的重构是独立的，若某页（如 Dashboard）出问题，可单独回滚该文件到旧版，不影响其他页面。

## 8. 风险与假设

### 8.1 最脆弱的假设

1. **Dashboard 聚合数据性能**
   - 假设用户/角色/菜单的数据量很小（< 1000 条），直接调列表 API 取 `data.length` 不会慢。
   - 如果实际数据量巨大，Dashboard 加载会阻塞。
   - **应对**：Phase 4 先实现 UI，数据聚合逻辑封装在 hook 中，若出现性能问题可快速替换为后端轻量统计接口。

2. **"好看"的主观标准**
   - 计划假设"大留白 + slate 中性灰 + teal 主色 + 克制动效"符合你对"好看"的定义。
   - 如果实现后你觉得"太素"或"太冷"，需要调整主色饱和度或增加材质（如 subtle 纹理）。

### 8.2 其他风险

- **Ant Design Menu 窄栏限制**：`collapsedWidth={64}` 下 Ant Design Menu 的 tooltip 和 submenu 行为可能有限，需通过 CSS 微调。
- **移动端动效性能**：低端机型上 `framer-motion` 的 layout 动画可能掉帧，保持克制可规避大部分问题。
- **暗色模式 Logo/品牌色**：如果项目有带颜色的 Logo 图片，暗色模式下可能需要反白版本，需在 Phase 2 验收时确认。

## 9. 验证总览

| 检查项 | 阶段 | 验证方式 |
|--------|------|----------|
| 三色模式颜色正确 | Phase 1 | 手动切换 light/dark/system |
| 侧边栏动画平滑 | Phase 2 | 桌面端收起/展开，移动端抽屉 |
| 路由切换动效 | Phase 3 | 切换各路由页面 |
| Dashboard 数字动画 | Phase 4 | 刷新 Dashboard 页面 |
| 列表 stagger 入场 | Phase 4 | 刷新列表页 |
| 移动端无溢出 | Phase 4 | Chrome DevTools 移动端模拟 |
| 暗色模式无刺眼色 | Phase 5 | 切换暗色模式逐项检查 |
| 性能达标 | Phase 5 | Lighthouse Performance > 80 |
