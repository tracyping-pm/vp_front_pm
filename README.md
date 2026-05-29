# README

The project is built using`@umijs/max`,refer to the documentation for more features [Introduction to Umi Max](https://umijs.org/docs/max/introduce)

## Project Structure

For more directory structures and their functions, refer to the documentation [Umi Max Directory Structure](https://umijs.org/docs/guides/directory-structure)

```bash

├── config          # Project configuration files, dev, test, and prod are deployment configurations, local is for local configuration
  ├── config.test.ts     # Deployment test environment configuration file
  ├── config.dev.ts      # Deployment development environment configuration file
  ├── config.prod.ts     # Deployment production environment configuration file
  ├── config.ts     # Local development environment configuration file
  ├── routes.tsx    # Project page routing configuration file
  └── proxy.ts      # The proxy field in proxy.ts can be configured to proxy backend API requests in development mode.

├── public          # Store static assets that don't need processing, will be copied to output folder after build

├── src             # The main directory for storing project business code
  ├── api           # Project Business API Requests
  ├── assets        # Project static assets directory. Note that assets here will go through the bundling build process.
  ├── components    # Project common components directory
  ├── constants     # Project common constants directory
  ├── models        # Project global shared data directory
  ├── pages         # Project router pages directory
  ├── utils         # Project common utils directory
  ├── access.ts     # Project permission management files
  ├── app.ts        # Project runtime configuration files
  ├── global.les    # Project global common styles files
  ├── overrides.les # High Priority Global Styles File
  └── loading.tsx   # Project Global Loading Component

├── env.[type].ts   # Environment Variables File
├── legacy.d.ts     # Global Variables Declaration File
├── package.json    # Project Dependencies and Script Commands
├── Dockerfile.[env]    # Dockerfile config setting
└── README.md       # README
```

## 本地启动（Demo 演示模式）

VP 需要与 TMS 项目**同时启动**，数据才能互通。VP 使用 `start:tms-proxy` 脚本，以 `/vp/` 为路径前缀运行在与 TMS 相同的 `localhost:8000` 上，共享同一个 localStorage。

### 前置要求

- Node.js ≥ 18
- pnpm（如未安装：`npm install -g pnpm`）

### 第一步：先启动 TMS

```bash
# 在 tms_frontend-main 目录下
pnpm install
pnpm start         # 运行在 http://localhost:8000
```

### 第二步：启动 VP

```bash
# 在 vp_frontend-main 目录下
pnpm install
npm run start:tms-proxy   # 运行在 http://localhost:8000/vp/home
```

> **注意**：不要用 `start:dev`，那会启动在 `localhost:7000`，与 TMS 的 localStorage 隔离，数据无法互通。

### 演示入口

| 系统 | 地址 |
|------|------|
| TMS（内部操作侧） | http://localhost:8000/home |
| VP（供应商侧） | http://localhost:8000/vp/home |

本地启动无需登录，直接访问即可。

---

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

## Provided Scripts

### Start project

```bash
npm run start:tms-proxy   # Demo 模式（推荐）
npm run start:dev         # 独立模式（localhost:7000，数据不与 TMS 互通）
```

### Build project

```bash
pnpm build:dev
```

### Check code style

```bash
pnpm lint
```

### Check ts style

```bash
pnpm tsc
```

## Swagger

Swagger address to be confirmed.

## Others

husky is used to prevent bad git commit, you can also use it to lint and test before git push.

```bash
npx husky-init
```

Basic UI Component Library [Introduction to Antd Pro](https://procomponents.ant.design/) Seamless integration with the Ant Design system and the antd project [Introduction to Antd](https://ant.design/)

We recommended to use vscode IDE for development. We recommend installing prettier and eslint plugins to ensure a consistent code style!
