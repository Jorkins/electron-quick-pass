# DeskMind

Electron + Vue3 + TypeScript 跨平台桌面客户端骨架，配套《Electron 快速通关系列》主线 Demo。

## 技术栈

- Electron 45.x（主进程 / 预加载 / 渲染进程三进程）
- electron-vite 6.x（构建与 HMR）
- Vue 3.5 + TypeScript 5.x + Pinia（渲染进程）
- electron-builder 26.x（win / mac / linux 打包）

## 目录约定

- `src/main` — 主进程（BrowserWindow、生命周期、原生能力）
- `src/preload` — 预加载脚本（contextBridge，向渲染进程暴露白名单 API）
- `src/renderer` — 渲染进程（Vue3 应用，零 Node 权限）
- `shared` — 主/渲染共享类型与 IPC 通道常量

## 脚本

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发模式（带 HMR）
pnpm typecheck      # 类型检查
pnpm build          # 生产构建
pnpm build:win      # 打包 Windows
pnpm build:mac      # 打包 macOS
pnpm build:linux    # 打包 Linux
```

> 配套源码：`https://github.com/JorkIns/electron-quick-pass`，全程单工程、单 `main` 分支，逐关累加。
