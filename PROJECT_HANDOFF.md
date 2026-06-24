# BrainBall Social Demo - Agent Handoff

## 项目在做什么

这是一个前端交互 demo，项目名为 **BrainBall Social Demo**。

产品概念是一个“脑电 Love 社交平台”。当前版本不接真实 EEG、不接脑机接口，所有脑纹和用户数据都来自 mock 数据。核心体验是让用户选择自己的五行脑纹类型，然后进入地球脑纹分布和脑电社区空间。

整体视觉风格：

- 黑色背景
- 淡蓝色边框
- 半透明玻璃卡片
- 发光 Brain Ball
- 柔和渐变和彗星拖尾

## 技术栈

- React
- TypeScript
- Vite
- CSS 写在 `src/styles/globals.css`

当前没有使用：

- React Router
- Tailwind
- Three.js
- 后端 API
- 真实 EEG 数据源

## 本地运行

当前环境使用项目内的 pnpm：

```powershell
tools\pnpm.exe install
tools\pnpm.exe run dev -- --port 5173
```

构建检查：

```powershell
tools\pnpm.exe run build
```

本地地址：

```text
http://127.0.0.1:5173
```

注意：`node_modules`、`dist`、`tools` 都在 `.gitignore` 中，不应提交。

## 页面流程

路由是手写的，入口在 `src/App.tsx`。

页面路径：

- `/`：脑纹选择页
- `/globe`：地球脑纹分布页
- `/community`：脑电社区页

用户选择脑纹后会写入：

```text
localStorage["brainball:selectedProfile"]
```

如果用户没有选择脑纹，访问 `/globe` 或 `/community` 会自动回到 `/`。

## 目录结构

```text
src/
  App.tsx
  main.tsx

  components/
    BrainBall.tsx
    ChatModal.tsx
    NavigationBar.tsx
    UserCard.tsx

  data/
    brainTypes.ts
    mockUsers.ts

  features/
    onboarding/
      OnboardingPage.tsx
      BrainTypeSelector.tsx

    globe/
      GlobePage.tsx
      GlobeView.tsx
      FilterPanel.tsx

    community/
      CommunityPage.tsx
      CommunitySpace.tsx
      models/
        CommunitySimulation.ts

  types/
    brain.ts
    user.ts

  utils/
    fiveElements.ts
    physics.ts
    randomGeo.ts

  styles/
    globals.css
```

## 架构约定

项目已经按功能板块拆分到 `src/features`。

继续开发时请保持这个边界：

- `features/onboarding`：脑纹选择
- `features/globe`：地球分布
- `features/community`：脑电社区
- `components`：跨页面复用 UI
- `data`：mock 数据
- `utils`：通用规则和物理工具
- `types`：共享类型

不要把新功能堆回一个大组件里。

## 数据模型

脑纹类型在：

```text
src/data/brainTypes.ts
```

当前五种脑纹：

- 金 Metal
- 木 Wood
- 水 Water
- 火 Fire
- 土 Earth

mock 用户在：

```text
src/data/mockUsers.ts
```

每个 mock 用户包含：

- `id`
- `name`
- `brainType`
- `color`
- `location`
- `matchScore`

## 五行关系

关系规则在：

```text
src/utils/fiveElements.ts
```

当前规则：

- 相生：吸引
- 相克：排斥
- 同类型：`neutral`，没有作用力

相生关系：

- 木生火
- 火生土
- 土生金
- 金生水
- 水生木

相克关系：

- 木克土
- 土克水
- 水克火
- 火克金
- 金克木

## 地球页说明

主要文件：

```text
src/features/globe/GlobePage.tsx
src/features/globe/GlobeView.tsx
src/features/globe/FilterPanel.tsx
```

当前实现：

- CSS 视觉球体，不是 Three.js
- 手写经纬度投影
- 鼠标按住地球可拖动旋转
- 背面 Brain Ball 隐藏
- 点击可见 Brain Ball 弹出用户卡片
- 可以按脑纹类型筛选

如果要升级真实 3D，优先替换 `GlobeView.tsx`，不要动数据层。

## 脑电社区说明

主要文件：

```text
src/features/community/CommunityPage.tsx
src/features/community/CommunitySpace.tsx
src/features/community/models/CommunitySimulation.ts
```

这是当前项目里最复杂的模块。

社区是一个平面弹球空间：

- 所有 Brain Ball 都有半径
- 球与球不能重叠
- 球碰到边框会柔和弹开
- 用户球由鼠标目标点牵引
- 用户球不会死贴鼠标，会有受力偏移
- 鼠标目标点和用户球之间有张力线
- 所有 Brain Ball 都有彗星式拖尾
- 用户以外的 Brain Ball 有自发动力
- 用户以外的 Brain Ball 运动幅度为普通基础的 `2.5x`
- 用户球速度倍率当前是 `1.05`
- 相斥球碰撞会弹开
- 相吸球碰撞会吸附在一起
- 吸附球可被更大冲击撞开
- 点击随机球会弹出互动卡片

## 社区物理抽象

物理模拟类：

```text
src/features/community/models/CommunitySimulation.ts
```

核心类：

```ts
CommunitySimulation
BrainBallEntity
```

`CommunitySimulation` 负责：

- 保存所有球状态
- 保存用户球状态
- 保存鼠标目标点
- 保存吸附关系
- 每帧推进物理
- 输出 `CommunitySnapshot`

`CommunitySpace.tsx` 负责：

- 接收鼠标事件
- 调用 `simulation.step(...)`
- 渲染球、轨迹、力线和互动

如果要调社区手感，优先改 `CommunitySimulation.ts` 顶部常量：

```ts
const BALL_RADIUS = 19;
const COLLISION_DISTANCE = BALL_RADIUS * 2;
const BOND_DISTANCE = BALL_RADIUS * 2;
const BOND_BREAK_DISTANCE = BALL_RADIUS * 3.2;
const BOND_BREAK_SPEED = 1.15;
const TRAIL_LENGTH = 16;
const MOTION_MULTIPLIER = 2.5;
const SELF_PROPULSION = 0.018 * MOTION_MULTIPLIER;
const USER_SPEED_MULTIPLIER = 1.05;
```

## 共享 UI 组件

```text
src/components/BrainBall.tsx
src/components/UserCard.tsx
src/components/ChatModal.tsx
src/components/NavigationBar.tsx
```

这些组件被多个页面复用，不要轻易移动到某个 feature 内。

## 样式说明

所有样式集中在：

```text
src/styles/globals.css
```

目前 CSS 是全局类名。继续开发时建议：

- 保持类名语义清晰
- 不要引入过重 UI 框架
- 需要大量新样式时，可以考虑按 feature 拆 CSS，但目前还没必要

## 已知注意事项

- 项目依赖本地 `tools\pnpm.exe` 运行，但该目录不提交。
- 当前 GitHub 仓库地址是 `https://github.com/Frieda-Fan/brain-love.git`。
- `dist` 是构建产物，不提交。
- `node_modules` 不提交。
- 社区每帧通过 React state 渲染，当前 18 个球可接受。如果球数大幅增加，建议改 canvas。

## 后续优化建议

优先级建议：

1. 为项目补一份正式 README，面向普通用户。
2. 给社区物理增加参数面板，便于调试手感。
3. 将社区轨迹改为 canvas，减少 DOM 节点。
4. 将地球页替换成 Three.js 真实球体。
5. 接入真实用户/脑电数据时，只替换 `data` 层，不要直接改页面组件。

## 接手时的第一步

新 Agent 接手后建议先运行：

```powershell
tools\pnpm.exe install
tools\pnpm.exe run build
tools\pnpm.exe run dev -- --port 5173
```

然后打开：

```text
http://127.0.0.1:5173
```

快速检查：

- 首页是否能选择脑纹
- 地球页是否能拖动旋转
- 地球光点是否能弹用户卡片
- 社区页球体是否持续运动
- 用户球是否跟随鼠标并受力偏移
- 随机球是否有彗星尾迹
