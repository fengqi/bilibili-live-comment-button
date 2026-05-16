# Bilibili 直播折叠评论区 — Chrome 扩展

## 项目概述

在 Bilibili 直播页面右侧评论区边缘添加一个浮动折叠按钮，点击可收起/展开评论区，播放器自动扩展填满空间。类似 Twitch 的聊天折叠功能。

## 文件结构

```
bilibili-live-collapse/
├── manifest.json          # Chrome Manifest V3
├── content.js             # 注入脚本（核心逻辑）
├── content.css            # 按钮样式
├── popup.html             # 扩展弹窗（设置界面）
├── popup.js               # 弹窗逻辑
└── icons/
    └── icon128.png        # 扩展图标
```

## 核心功能

### 折叠逻辑

- 隐藏 `#aside-area-vm`（评论区容器），用 `display: none !important` 强制覆盖 Vue 样式
- 展开 `#player-ctnr`（播放器容器）到指定宽度，小于 100% 时 `margin: 0 auto` 居中
- 通过 `document.body.classList` 记录折叠状态（`bili-chat-collapsed`），body 在 SPA 切换时不会重建，状态自动保持

### 按钮

- 浮动在 `#player-ctnr` 右侧，`position: absolute` + `top: N%`
- 图标：`▶`（展开时显示，点击收起）/ `◀`（收起时显示，点击展开）
- 点击 `toggle()` 切换 class + 调整播放器宽度 + 更新图标

### 设置（Chrome 弹窗）

通过 `chrome.storage.local` 同步两个设置项：

| 设置 | key | 范围 | 默认 | 作用 |
|------|-----|------|------|------|
| 按钮位置 | `btnPos` | 1–100 | 25 | 按钮在播放器右侧的垂直位置 % |
| 收起宽度 | `playerWidth` | 50–100 | 100 | 收起后播放器宽度 %，<100 时居中 |

`chrome.storage.onChanged` 监听设置变更，实时更新。

### SPA 路由切换

`setInterval` 每秒轮询 `location.href`，URL 变化时重建 MutationObserver，延迟 1.5s 后重新初始化。

## DOM 依赖

扩展依赖以下 Bilibili Vue 渲染的 DOM 元素（选择器稳定）：

| 元素 | 作用 |
|------|------|
| `#aside-area-vm` | 评论区容器，hide/show 的目标 |
| `#player-ctnr` | 播放器容器，宽度调整的目标 |

如果 Bilibili 更新页面结构导致这些 ID 变更，需要更新 `content.js` 中的选择器。

## 事件流

```
页面加载
  → content.js 执行
  → chrome.storage.local.get() 读取设置（异步）
  → MutationObserver 等待 #aside-area-vm / #player-ctnr 出现
  → tryInit() 创建按钮
  → 若 localStorage 有折叠记录，恢复状态

用户点击按钮
  → toggle()
  → classList.toggle('bili-chat-collapsed')
  → display: none on #aside-area-vm
  → 调整 #player-ctnr 宽度 + 居中
  → 更新按钮图标

用户点击扩展图标
  → popup.html 显示
  → popup.js 读取 chrome.storage.local 填充滑块
  → 滑块变化 → chrome.storage.local.set()
  → content.js 的 onChanged 监听 → applySettings()
```

## 代码规范

- 使用 `var`（此项目需兼容 Chrome 扩展 MV3 环境，无需 ESM/模块）
- ID 查找用 `document.getElementById()`，比 `querySelector('#id')` 快
- class 操作用 `classList.toggle()` 替代 `contains` + `add/remove`
- CSS 注入用单行压缩字符串（`s.textContent = '...'`）
- 所有元素创建用 `document.createElement()`，避免 innerHTML 注入
- `chrome.storage` 回调风格用 callback（不支持 async/await 时）
- 不在 content.js 中注入多余的 UI 元素，设置统一走扩展弹窗
