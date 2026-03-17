# Plugin Development Guide

This guide covers everything needed to build, test, and publish custom plugins for the **osn.** CLI platform.

## Overview

An **osn.** plugin is a standard npm package that exports a plugin definition created with the `definePlugin()` factory function from `@osndot/sdk`. Plugins can register CLI commands, hook into task lifecycle events, and access a shared context.

## Project Setup

### From Scratch

```bash
mkdir osn-plugin-example && cd osn-plugin-example
pnpm init
pnpm add @osndot/sdk
pnpm add -D typescript tsup vitest @types/node
```

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Recommended `tsup.config.ts`

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    target: "node20",
});
```

### Package Conventions

Your `package.json` should follow these conventions:

```json
{
  "name": "@yourscope/plugin-example",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "dependencies": {
    "@osndot/sdk": "latest"
  }
}
```

For official plugins within the **osn.** monorepo, use the `@osndot` scope and the `workspace:*` protocol for the SDK dependency.

## Creating a Plugin

### Basic Structure

```typescript
// src/index.ts
import { definePlugin } from "@osndot/sdk";

export default definePlugin({
  name: "@yourscope/plugin-example",
  version: "1.0.0",
  description: "An example plugin for OSN",
  setup(ctx) {
    return {
      commands: [
        {
          name: "example:hello",
          description: "Print a greeting",
          handler: async () => {
            ctx.logger.info("Hello from the example plugin.");
          },
        },
      ],
      hooks: {
        onLoad: () => ctx.logger.debug("Plugin loaded."),
        onUnload: () => ctx.logger.debug("Plugin unloaded."),
      },
    };
  },
});
```

### Async Setup

The `setup` function can be asynchronous. This is useful when plugin initialization requires network requests, file system reads, or other async operations:

```typescript
export default definePlugin({
  name: "@yourscope/plugin-db",
  version: "1.0.0",
  description: "Database plugin",
  async setup(ctx) {
    // Perform async initialization
    const schema = await loadDatabaseSchema(ctx.cwd);

    return {
      commands: [
        {
          name: "db:migrate",
          description: "Run database migrations",
          handler: async () => {
            await runMigrations(schema);
            ctx.logger.success("Migrations complete.");
          },
        },
      ],
    };
  },
});
```

When using async setup, the CLI plugin loader awaits the setup completion before registering commands and hooks. Both sync and async plugins work transparently.

## Plugin Context

The `setup` function receives a `PluginContext` object:

| Property | Type | Description |
|----------|------|-------------|
| `ctx.cwd` | `string` | Current working directory. Uses a getter, so the value is always current rather than captured at import time. |
| `ctx.config` | `Record<string, unknown>` | Plugin-specific configuration from the `plugins` entry in `project.json`. |
| `ctx.logger` | `Logger` | Logging interface with methods: `info`, `warn`, `error`, `debug`, `success`. |

### Using the Logger

```typescript
ctx.logger.info("Processing files...");
ctx.logger.warn("Deprecation notice: use the new API.");
ctx.logger.error("Connection failed.");
ctx.logger.debug("Internal state: ready");
ctx.logger.success("Operation completed.");
```

Log output respects the global `--verbose` and `--debug` flags. Debug messages are only visible when the user runs with `--debug`.

### Accessing the Working Directory

```typescript
const configPath = `${ctx.cwd}/.env`;
```

The `cwd` property dynamically resolves to the current working directory on every access, so it always reflects the user's actual location.

## Lifecycle Hooks

Hooks allow plugins to react to events in the CLI lifecycle.

| Hook | Signature | When It Runs |
|------|-----------|--------------|
| `onLoad` | `() => void \| Promise<void>` | After the plugin is imported and its setup completes. Called once during CLI startup. |
| `onUnload` | `() => void \| Promise<void>` | When the CLI process is shutting down. Handles SIGINT, SIGTERM, and normal exit. Use for cleanup: closing connections, flushing buffers. |
| `onBeforeTask` | `(taskName: string) => void \| Promise<void>` | Before any task command is executed via `osn run`. Called for every task, including dependencies. |
| `onAfterTask` | `(taskName: string, success: boolean) => void \| Promise<void>` | After a task command completes. The `success` parameter indicates whether the command exited successfully. |

### Hook Example

```typescript
hooks: {
  onLoad: () => {
    ctx.logger.debug("Initializing resources...");
  },
  onUnload: async () => {
    await closeDatabase();
    ctx.logger.debug("Cleanup complete.");
  },
  onBeforeTask: (taskName) => {
    ctx.logger.info(`Preparing for task: ${taskName}`);
  },
  onAfterTask: (taskName, success) => {
    if (!success) {
      ctx.logger.warn(`Task ${taskName} failed. Check the output above.`);
    }
  },
},
```

### Error Handling in Hooks

Hook errors are caught by the CLI and logged as warnings. They do not prevent task execution or other hooks from running. This ensures that a misbehaving plugin does not break the user's workflow.

## Registering Commands

Commands are the primary way plugins add functionality to the CLI.

### Command Structure

```typescript
{
  name: "prefix:action",
  description: "What this command does",
  handler: async () => {
    // Implementation
  },
}
```

### Naming Convention

Command names use the `prefix:action` format. The CLI automatically maps this to a subcommand structure:

| Plugin Name | Command Name | CLI Command |
|-------------|-------------|-------------|
| `@osndot/plugin-git` | `git:status` | `osn git status` |
| `@osndot/plugin-git` | `git:log` | `osn git log` |
| `@myorg/plugin-deploy` | `deploy:staging` | `osn deploy staging` |

The prefix is derived from the plugin name by removing `@scope/plugin-`.

### Running Shell Commands

Plugins commonly execute shell commands. Use Node.js built-in modules:

```typescript
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Inside a command handler:
handler: async () => {
  try {
    const { stdout } = await execAsync("git status --short", {
      cwd: ctx.cwd,
    });
    ctx.logger.info(stdout || "Working directory clean.");
  } catch (error) {
    ctx.logger.error("Git is not available.");
  }
},
```

### File System Operations

For file-based plugins, use `node:fs/promises`:

```typescript
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

handler: async () => {
  const envPath = join(ctx.cwd, ".env");
  const content = await readFile(envPath, "utf-8");
  ctx.logger.info(content);
},
```

## Testing Plugins

### Test Setup

Add a `vitest.config.ts` to your plugin:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});
```

### Structure Tests

Verify that the plugin exports the correct metadata, commands, and hooks:

```typescript
import { describe, it, expect } from "vitest";
import plugin from "../index.js";

describe("my-plugin", () => {
  it("should have correct metadata", () => {
    expect(plugin.name).toBe("@yourscope/plugin-example");
    expect(plugin.version).toBe("1.0.0");
  });

  it("should register expected commands", () => {
    expect(plugin.commands).toHaveLength(1);
    expect(plugin.commands![0].name).toBe("example:hello");
  });

  it("should define lifecycle hooks", () => {
    expect(typeof plugin.onLoad).toBe("function");
    expect(typeof plugin.onUnload).toBe("function");
  });
});
```

### Handler Tests

For handlers that interact with the file system or shell, use temporary directories and mocks:

```typescript
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), "plugin-test-"));
});

afterEach(async () => {
  await rm(testDir, { recursive: true });
});
```

## Publishing

### Build and Verify

```bash
pnpm build
pnpm test
```

### Publish to npm

```bash
npm publish --access public
```

### Peer Dependencies

When publishing your plugin, make sure your build output references the OSN SDK properly in your `package.json`. You should set it as a `peerDependency`:

```json
{
  "name": "@my-org/plugin-custom",
  "peerDependencies": {
    "@osndot/sdk": ">=0.1.0"
  }
}
```

### Plugin Naming Convention

- Official plugins: `@osndot/plugin-<name>`
- Third-party plugins: `@yourscope/plugin-<name>` or `osn-plugin-<name>`

### Installation by Users

```bash
osn plugin add @yourscope/plugin-example
```

The CLI validates the installed package, reads its version, and registers it in the user's `project.json`.

## Type Reference

All types are exported from `@osndot/sdk`:

```typescript
import type {
  OsnPlugin,
  PluginContext,
  PluginCommand,
  LifecycleHooks,
  DefinePluginOptions,
  OsnPluginSetupResult,
} from "@osndot/sdk";
```

| Type | Description |
|------|-------------|
| `OsnPlugin` | The fully resolved plugin object with metadata, commands, and hooks |
| `PluginContext` | Context passed to the `setup` function |
| `PluginCommand` | A single command definition with name, description, and handler |
| `LifecycleHooks` | Interface for all supported lifecycle hooks |
| `DefinePluginOptions` | Options accepted by `definePlugin()` |
| `OsnPluginSetupResult` | Return type of the `setup` function |
