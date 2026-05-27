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

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
pnpm start:dev
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
