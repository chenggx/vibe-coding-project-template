# Vibe Coding 执行计划

基于 `doc/design.md`，将设计计划拆解为可直接复制粘贴给 AI 的提示词（Prompt）。

**执行规则**：
- 按 Prompt 序号顺序执行，每个 Prompt 依赖前一个完成。
- 每个 Prompt 包含：前置依赖、需读取文件、任务描述、设计规范、约束、验收标准。
- 将 Prompt 直接发送给 AI（如 Claude Code、Cursor Chat），AI 会读取上下文文件并生成代码。
- 每完成一个 Prompt，运行 `pnpm dev` 验证后再继续下一个。

---

## 设计常量（所有 Prompt 共享）

```
主色（Primary）:        #0d9488
主色悬停:               #0f766e
暗色模式主色:            #14b8a6

背景（Light）:          #f8fafc
背景（Dark）:           #0f172a
卡片背景（Light）:       #ffffff
卡片背景（Dark）:        #1e293b

文字主色（Light）:       #1e293b
文字主色（Dark）:        #e2e8f0
文字次色（Light）:       #64748b
文字次色（Dark）:        #94a3b8

边框（Light）:          #e2e8f0
边框（Dark）:           #334155

圆角：卡片 8px，按钮 6px，标签 9999px
间距：桌面 32px，移动 16px
内容区最大宽度：1440px

侧边栏展开：220px
侧边栏收起：64px
顶部栏高度：64px

字体：Outfit, 'PingFang SC', 'Microsoft YaHei', sans-serif
```

---

## Prompt 1: 安装动效库 + 配置 Ant Design 主题 Token

**前置依赖**: 无

**需要读取的文件**:
- `frontend/package.json`
- `frontend/src/App.tsx`
- `frontend/src/modules/theme/slice.ts`（如果有主题切换相关逻辑）

**任务**:
1. 在 `frontend/` 目录下安装 `framer-motion`：`pnpm add framer-motion`
2. 修改 `App.tsx` 中的 `ConfigProvider`，替换为以下 token：
   - `colorPrimary: '#0d9488'`
   - `colorBgLayout: '#f8fafc'`
   - `colorBgContainer: '#ffffff'`
   - `colorText: '#1e293b'`
   - `colorTextSecondary: '#64748b'`
   - `colorBorder: '#e2e8f0'`
   - `borderRadius: 8`
   - `borderRadiusSM: 6`
   - `borderRadiusLG: 8`
   - `fontFamily: "Outfit, 'PingFang SC', 'Microsoft YaHei', sans-serif"`
   - `boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'`
   - `boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.05)'`
3. 确保暗色模式下 `ConfigProvider` 的 token 也能动态切换。如果当前是静态配置，改为根据主题状态动态传入 `theme.darkAlgorithm` 和对应的暗色 token。

**约束**:
- 不改路由、不改 Redux store 结构、不改页面组件。
- 保持现有 `Outfit` 字体加载方式。

**验收标准**:
- [ ] `pnpm install` 成功，`framer-motion` 出现在 `package.json`
- [ ] `pnpm dev` 启动后，按钮、链接的主色变为 teal `#0d9488`
- [ ] 切换暗色模式后，整体背景变为深色，无刺眼颜色

---

## Prompt 2: 重写全局 CSS 变量与 Ant Design 覆盖样式

**前置依赖**: Prompt 1 完成

**需要读取的文件**:
- `frontend/src/styles/global.css`
- `frontend/src/styles/antd.override.css`
- `frontend/src/styles/responsive.css`

**任务**:
1. 重写 `global.css` 中的 `:root` CSS 变量：
   ```css
   :root {
     --color-text-primary: #1e293b;
     --color-text-secondary: #64748b;
     --color-bg-page: #f8fafc;
     --color-bg-card: #ffffff;
     --color-border: #e2e8f0;
     --color-accent: #0d9488;
     --color-accent-hover: #0f766e;
     --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
     --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05);
     --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
   }
   ```
2. 补充 `[data-theme="dark"]` 下的变量映射：
   ```css
   [data-theme="dark"] {
     --color-text-primary: #e2e8f0;
     --color-text-secondary: #94a3b8;
     --color-bg-page: #0f172a;
     --color-bg-card: #1e293b;
     --color-border: #334155;
     --color-accent: #14b8a6;
     --color-accent-hover: #2dd4bf;
     --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
     --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
     --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
   }
   ```
3. 更新 `antd.override.css`：
   - 按钮圆角改为 6px
   - 卡片圆角改为 8px
   - 模态框圆角改为 8px
   - Card 组件阴影使用 `--shadow`
   - Table 行 hover 背景色使用 `rgba(13, 148, 136, 0.04)`（light）和 `rgba(20, 184, 166, 0.08)`（dark）
   - Input focus ring 颜色使用 `--color-accent`

**约束**:
- 不要删除 `responsive.css` 中的断点规则，只补充需要调整的。
- 全局搜索旧主色 `#c45c3e`，如果作为 `error` 色保留则不动，如果作为 `primary` 或装饰色则替换。

**验收标准**:
- [ ] 所有页面背景变为 `#f8fafc`（light）
- [ ] Card 默认带淡阴影，圆角 8px
- [ ] 切换暗色模式后，所有自定义变量正确映射
- [ ] 全局搜索 `#c45c3e`（排除 error 场景），确认无残留

---

## Prompt 3: 重塑 AppLayout 布局骨架

**前置依赖**: Prompt 2 完成

**需要读取的文件**:
- `frontend/src/components/layout/AppLayout.tsx`
- `frontend/src/components/layout/AppLayout.module.css`

**任务**:
1. 修改 `AppLayout.tsx`：
   - 最外层布局背景使用 `var(--color-bg-page)`
   - 内容区（`Outlet` 所在区域）增加样式：`maxWidth: 1440px`, `margin: 0 auto`, `width: 100%`
   - 内容区内边距：桌面端 `32px`，移动端 `16px`
   - 保持 Sidebar、Header、MobileDrawer 的引用不变
2. 修改 `AppLayout.module.css`：
   - 更新 flex 布局，确保内容区能正确居中
   - 删除硬编码的旧颜色值

**约束**:
- 不要改 Sidebar、Header 等子组件的 props 接口。
- 保持移动端抽屉的触发逻辑不变。

**验收标准**:
- [ ] 桌面端内容区在 1440px 以内居中，两侧留白
- [ ] 移动端内容区内边距为 16px，无横向滚动
- [ ] 暗色模式下背景色正确

---

## Prompt 4: 重塑 Sidebar 侧边栏

**前置依赖**: Prompt 3 完成

**需要读取的文件**:
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Sidebar.module.css`
- `frontend/src/modules/menu/iconConfig.tsx`（了解菜单图标映射）

**任务**:
1. 修改 `Sidebar.tsx`：
   - 展开宽度 220px，收起宽度 64px
   - `Menu` 组件设置 `mode="inline"`、`collapsedWidth={64}`、`inlineCollapsed={collapsed}`
   - 精简 Logo 区域：只保留图标或简写文字，减少高度占用
   - 收起状态下图标居中，无文字溢出
2. 修改 `Sidebar.module.css`：
   - 侧边栏背景使用 `var(--color-bg-card)`
   - 增加 `transition: width 0.3s ease`
   - 窄栏（64px）时菜单项图标居中
   - 暗色模式下边框色使用 `var(--color-border)`
   - 去除多余的阴影或边框（现代风格偏好扁平或极淡分隔）

**约束**:
- 保持菜单数据源 `userMenus` 不变。
- 保持 `collapsed` 状态的 Redux 连接不变。
- 不要改菜单点击跳转逻辑。

**验收标准**:
- [ ] 桌面端：侧边栏可收起为 64px，图标居中；展开为 220px，动画平滑
- [ ] 暗色模式下侧边栏背景与整体协调
- [ ] 移动端：侧边栏正常以抽屉形式弹出（MobileDrawer）

---

## Prompt 5: 重塑 Header 与 MobileDrawer

**前置依赖**: Prompt 4 完成

**需要读取的文件**:
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/MobileDrawer.tsx`

**任务**:
1. 修改 `Header.tsx`：
   - 高度保持 64px
   - 去除底边框（`border-bottom` 设为 `none` 或 `1px solid var(--color-border)`）
   - 背景设为透明或 `var(--color-bg-page)`，与内容区融合
   - 保持左侧 toggle 按钮、中间主题切换、右侧 UserDropdown
   - 各元素垂直居中
2. 修改 `MobileDrawer.tsx`：
   - Drawer 背景使用 `var(--color-bg-card)`
   - 增加圆角（顶部或整体 8px，视 Ant Design Drawer API 而定）
   - 内部 Menu 样式与 Sidebar 一致

**约束**:
- 不改主题切换逻辑（light/dark/system）。
- 不改 UserDropdown 的菜单项。

**验收标准**:
- [ ] Header 与内容区无明显分割线，视觉融合
- [ ] 移动端抽屉弹出时，圆角和阴影符合新风格
- [ ] 暗色模式下 Header 和 Drawer 颜色正确

---

## Prompt 6: 创建动效基础组件

**前置依赖**: Prompt 5 完成

**需要读取的文件**:
- `frontend/src/app/routes.tsx`（了解路由结构）

**任务**:
在 `frontend/src/components/common/` 下创建以下三个组件：

1. **`PageTransition.tsx`** — 路由页面过渡包装器
   - 使用 `framer-motion` 的 `AnimatePresence` + `motion.div`
   - 子页面进入：`initial={{ opacity: 0, y: 8 }}`、`animate={{ opacity: 1, y: 0 }}`、`exit={{ opacity: 0, y: -4 }}`
   - `transition={{ duration: 0.2, ease: 'easeOut' }}`
   - 接收 `children`，用 `<motion.div key={location.pathname}>` 包裹

2. **`FadeIn.tsx`** — 通用淡入容器
   - 支持 `stagger?: number` 和 `delay?: number` props
   - 容器：`variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger ?? 0.05 } } }}`
   - 子元素自动继承：`variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}`
   - 用 `useInView` 或直接用 `initial/animate` 控制

3. **`CountUp.tsx`** — 数字滚动组件
   - Props: `value: number`, `duration?: number`（默认 1.5）
   - 使用 `framer-motion` 的 `useInView` + `useSpring` + `useTransform`
   - 进入视口时数字从 0 滚动到 `value`
   - 显示为整数（`Math.floor`）

**约束**:
- 三个组件都是纯展示组件，不依赖 Redux。
- 使用 TypeScript，导出类型定义。
- 如果 `components/common/` 下已有 `index.ts` 导出，记得补充导出。

**验收标准**:
- [ ] 三个组件无 TypeScript 报错
- [ ] `pnpm build` 能正常通过（无 framer-motion 导入错误）

---

## Prompt 7: 接入路由切换动效

**前置依赖**: Prompt 6 完成

**需要读取的文件**:
- `frontend/src/app/routes.tsx`
- `frontend/src/components/layout/AppLayout.tsx`

**任务**:
1. 修改 `routes.tsx`：
   - 找到渲染页面内容的地方（通常是 `Outlet` 或路由表对应的组件渲染区域）
   - 用 `<PageTransition>` 包裹 `Outlet` 或各页面组件
   - 确保 `PageTransition` 能获取到当前路由的 `location.pathname` 作为 `key`
   - 如果 `routes.tsx` 中使用的是 `element: <Component />` 形式，考虑在 `AppLayout` 中包裹 `<Outlet />`
2. 如果 `AppLayout.tsx` 更适合包裹（因为 `routes.tsx` 是对象配置），则在 `AppLayout.tsx` 的 `<Outlet />` 外层包 `<PageTransition>`。

**约束**:
- 不要改路由定义对象（`path`、`element`、`lazy` 等）。
- 不要改 `AuthGuard` 的认证逻辑。

**验收标准**:
- [ ] 切换 `/dashboard`、`/users`、`/roles` 等路由时，页面内容有 fade + slide-up 过渡（0.2s）
- [ ] 无闪烁、无双重渲染
- [ ] 返回上一页时过渡正常

---

## Prompt 8: 重塑 Dashboard 仪表盘

**前置依赖**: Prompt 7 完成

**需要读取的文件**:
- `frontend/src/modules/dashboard/pages/DashboardPage.tsx`
- `frontend/src/modules/user/api.ts`（了解用户 API）
- `frontend/src/modules/role/api.ts`（了解角色 API）
- `frontend/src/modules/menu/api.ts`（了解菜单 API）
- `frontend/src/store/index.ts` 或相关 slice（了解 Redux state 结构）

**任务**:
1. 修改 `DashboardPage.tsx`：
   - **顶部统计卡片行**：使用 `Row` + `Col`（Ant Design）或 CSS Grid，展示 3 个卡片
     - 总用户数：从 Redux `user` state 取 `list.length` 或总数
     - 总角色数：从 Redux `role` state 取
     - 总菜单数：从 Redux `menu` state 取
     - 每个卡片的数字用 `<CountUp value={...} />` 展示
     - 卡片样式：白色背景、`var(--shadow)`、圆角 8px、padding 24px
   - **中部快捷入口**：4 个卡片（用户管理 / 角色管理 / 菜单管理 / 个人资料），点击跳转对应路由，带 hover 上浮效果（`translateY(-2px)` + shadow 增强）
   - **下部最近活动**：一个 Card，内部放占位列表（先用 mock 数据或显示"暂无数据"），展示最近登录用户或最近操作
2. 如果 Dashboard 当前没有引入 `user`、`role`、`menu` 的 state，需要在组件内 `useAppSelector` 引入。
3. 如果数据未加载，在 `useEffect` 中 dispatch 对应的 fetch actions。

**约束**:
- 不要新增后端 API。
- 如果当前 Redux 中没有总数字段，用列表长度代替。
- 保持现有权限逻辑（超管判断等）。

**验收标准**:
- [ ] Dashboard 有 3 个统计卡片，数字进入视口时有 count-up 动画
- [ ] 有 4 个快捷入口卡片，hover 时上浮
- [ ] 暗色模式下卡片背景、文字颜色正确
- [ ] 移动端卡片自动换行，无横向溢出

---

## Prompt 9: 重塑用户列表页

**前置依赖**: Prompt 8 完成

**需要读取的文件**:
- `frontend/src/modules/user/pages/UserListPage.tsx`
- `frontend/src/components/common/FadeIn.tsx`

**任务**:
1. 修改 `UserListPage.tsx`：
   - 页面根容器用 `<FadeIn stagger>` 包裹，使页面内容依次淡入
   - **搜索/操作区**：将搜索框、新增按钮等操作元素放入一个白色 Card 容器内，与下方表格分离
   - **表格区域**：Table 放入另一个白色 Card 容器
   - **Table 行 hover 效果**：在 `components/common/` 下创建一个可复用的 `StyledTable` 包装或直接在页面 CSS 中增加：
     - 行 hover 背景色 `rgba(13, 148, 136, 0.04)`（light）
     - 行 hover 时左侧出现 2px teal 竖条指示器
   - **分页器**：居中显示
2. 如果 `UserListPage` 当前结构较复杂，优先改造外层容器和视觉层级，不改内部表格列定义和数据逻辑。

**约束**:
- 不改用户 API 调用、表单提交逻辑。
- 不改权限判断（`usePermission`）。

**验收标准**:
- [ ] 刷新页面后，搜索区和表格区依次淡入（stagger 效果）
- [ ] 表格行 hover 有 teal 指示条和淡背景
- [ ] 暗色模式下 hover 效果仍然可见（用暗色映射值）
- [ ] 移动端卡片垂直堆叠，表格可横向滚动

---

## Prompt 10: 重塑角色列表页与菜单列表页

**前置依赖**: Prompt 9 完成

**需要读取的文件**:
- `frontend/src/modules/role/pages/RoleListPage.tsx`
- `frontend/src/modules/menu/pages/MenuListPage.tsx`
- `frontend/src/modules/user/pages/UserListPage.tsx`（参考用户列表的改造方式）

**任务**:
1. 将 `RoleListPage.tsx` 和 `MenuListPage.tsx` 按照 `UserListPage.tsx` 的模式改造：
   - 页面根容器用 `<FadeIn stagger>` 包裹
   - 搜索/操作区放入白色 Card
   - 表格放入白色 Card
   - 表格行增加相同的 hover 效果（左侧 teal 竖条 + 淡背景）
   - 分页器居中
2. 如果两个页面的结构差异较大，分别处理，但保持视觉一致。

**约束**:
- 不改角色/菜单的 API 调用和权限逻辑。

**验收标准**:
- [ ] 两个页面刷新后都有 stagger 淡入效果
- [ ] 表格行 hover 效果与 UserListPage 一致
- [ ] 暗色模式正常

---

## Prompt 11: 重塑个人资料页

**前置依赖**: Prompt 10 完成

**需要读取的文件**:
- `frontend/src/modules/auth/pages/ProfilePage.tsx`

**任务**:
1. 修改 `ProfilePage.tsx`：
   - 改为**上下卡片组**布局：
     - **顶部卡片**：个人信息概览（头像、姓名、角色名、邮箱），大号头像（80px），信息横向排列或左图右文
     - **底部卡片**：编辑资料表单，表单字段分组（如"基本信息"、"安全设置"），增加组标题和间距
   - 两个卡片都用 Ant Design `Card`，白色背景、`var(--shadow)`、圆角 8px
   - 页面根容器用 `<FadeIn>` 包裹
2. 如果当前页面表单字段很多，考虑用 `Row` + `Col` 分栏排列（桌面端两列，移动端一列）。

**约束**:
- 不改表单提交逻辑和字段验证。
- 不改头像上传组件的内部逻辑，只调整外层布局。

**验收标准**:
- [ ] 页面有上下两个卡片，视觉层级清晰
- [ ] 头像和信息区域排版美观
- [ ] 表单字段分组有明确标题
- [ ] 暗色模式下卡片和表单颜色正确

---

## Prompt 12: 重塑登录页

**前置依赖**: Prompt 11 完成

**需要读取的文件**:
- `frontend/src/modules/auth/pages/LoginPage.tsx`

**任务**:
1. 修改 `LoginPage.tsx`：
   - 整体布局：全屏居中，背景使用 `var(--color-bg-page)`
   - **登录卡片**：最大宽度 420px，白色背景、`var(--shadow-md)`、圆角 12px、padding 40px
   - **标题区**：大标题"欢迎回来"或"Welcome Back"，副标题一句话描述
   - **表单区**：
     - 输入框大圆角（6px），高度 44px
     - 全宽登录按钮，高度 44px，主色 `#0d9488`
     - 增加"记住我"复选框（如果原来有则保留）
   - 去除任何杂乱元素（如多余链接、装饰图）
   - 页面整体用 `<FadeIn>` 包裹，进入时有淡入效果
2. 可选：背景增加极淡的点状网格纹理（纯 CSS `background-image: radial-gradient(...)`），增加质感但不抢眼。

**约束**:
- 不改登录 API 调用和表单验证逻辑。
- 不改路由跳转逻辑（登录成功后跳转到 `/dashboard`）。

**验收标准**:
- [ ] 登录页居中精美，无杂乱元素
- [ ] 卡片有柔和阴影，输入框和按钮比例舒适
- [ ] 进入页面时有淡入动效
- [ ] 暗色模式下背景、卡片、输入框颜色协调
- [ ] 移动端卡片宽度自适应，padding 适中

---

## Prompt 13: 全局打磨、暗色适配与清理

**前置依赖**: Prompt 12 完成

**需要读取的文件**:
- 全局搜索 `style={{` 和 `#c45c3e` 的结果
- `frontend/src/components/common/PermissionButton.tsx`
- `frontend/src/components/common/PermissionWrapper.tsx`
- `frontend/src/components/common/ImageUploader.tsx`
- `frontend/src/styles/global.css`

**任务**:
1. **硬编码颜色清理**：
   - 全局搜索 `style={{` 中的硬编码颜色（`#333`、 `#666`、 `#999`、 `#000`、 `rgb(...)`）
   - 替换为 CSS 变量（`var(--color-text-primary)`、 `var(--color-text-secondary)` 等）
   - 全局搜索 `#c45c3e`，确认无残留（如果作为 `error` 色使用则保留）
2. **通用组件检查**：
   - `PermissionButton`、`PermissionWrapper`：确保按钮颜色跟随新 token
   - `ImageUploader`：确保边框、背景色使用 CSS 变量
3. **暗色模式逐项检查**：
   - 侧边栏背景、文字
   - Table 行 hover、表头背景
   - Card 阴影和背景
   - Modal / Drawer 背景
   - Input / Select focus ring
   - Pagination 按钮
4. **移动端触摸反馈**：
   - 为卡片和按钮增加 `:active` 状态（轻微 scale 或背景变暗），替代 hover 效果
5. **代码清理**：
   - 删除 Phase 1-12 中产生的未使用导入、未使用变量
   - 删除任何遗留的调试代码

**约束**:
- 不要删除功能代码。
- 如果某个硬编码颜色是第三方库组件的样式覆盖，保留注释说明。

**验收标准**:
- [ ] 全局搜索 `#c45c3e`（排除 error 场景），无残留
- [ ] 全局搜索 `style={{ color:` 和 `style={{ background:`，无硬编码旧色
- [ ] 暗色模式下所有页面无刺眼颜色、无丢失背景
- [ ] 移动端触摸按钮/卡片有视觉反馈
- [ ] `pnpm lint` 无未使用变量报错
- [ ] `pnpm build` 成功
- [ ] Lighthouse Performance > 80

---

## 执行顺序图

```
Prompt 1  →  Prompt 2  →  Prompt 3  →  Prompt 4  →  Prompt 5
安装+Token   全局样式       布局骨架      侧边栏        顶部栏+抽屉
                                              ↓
Prompt 6  →  Prompt 7  →  Prompt 8  →  Prompt 9  →  Prompt 10
动效组件      路由接入       Dashboard    用户列表      角色+菜单列表
                                              ↓
                                   Prompt 11  →  Prompt 12  →  Prompt 13
                                   个人资料      登录页        全局打磨
```

**每完成一个 Prompt，执行**：
```bash
pnpm dev        # 启动开发服务器验证
pnpm lint       # 检查代码风格
```

如果某个 Prompt 导致样式崩坏，回退到上一个 Prompt 的 git 状态，调整后再继续。
