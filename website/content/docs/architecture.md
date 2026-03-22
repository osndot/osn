---
title: Architecture
description: This document describes the internal architecture of the **osn.** CLI platform, including the package structure, data flow, plugin system, and configuration management.

section: Guide
order: 2
---
<div align="center">
<picture>
  <img
    alt="osn. Banner"
    src="https://github.com/osndot/osn/raw/main/assets/osn-banner.png"
    width="100%"
  />
</picture>
</div>
## System Overview

```
                    +-----------------------------------------+
                    |            osn. CLI                     |
                    |                                         |
                    |  +----------+ +--------+ +-----------+  |
                    |  | Commander| | Config | |  Plugin   |  |
                    |  |  Parser  | | (Zod)  | |  Loader   |  |
                    |  +----+-----+ +---+----+ +-----+-----+  |
                    |       |           |             |        |
                    |  +----+-----------+-------------+-----+  |
                    |  |          Runtime Engine             |  |
                    |  |  task resolution, dependency graph, |  |
                    |  |  lifecycle hook pipeline            |  |
                    |  +------------------------------------+  |
                    +------------------+----------------------+
                                       |
                    +------------------+------------------+
                    |                  |                  |
               +----+----+      +-----+-----+     +-----+----+
               | plugin  |      |  plugin   |     | plugin   |
               |   git   |      |  docker   |     |   env    |
               +---------+      +-----------+     +----------+
                    ^                  ^                 ^
                    +------------------+-----------------+
                                @osndot/sdk
                             (definePlugin)
```

## Package Structure

The project is a monorepo managed with pnpm workspaces. Each package is independently versioned and publishable to npm.

| Package | Path | Purpose |
|---------|------|---------|
| `@osndot/osn` | `packages/osn` | Core CLI application, task runner, plugin loader, configuration system |
| `@osndot/sdk` | `packages/sdk` | Plugin development SDK: `definePlugin` factory, type definitions, interfaces |
| `@osndot/plugin-git` | `packages/plugin-git` | Git integration: status and log commands |
| `@osndot/plugin-docker` | `packages/plugin-docker` | Docker integration: container listing and image builds |
| `@osndot/plugin-env` | `packages/plugin-env` | Environment management: `.env` file listing and initialization |

### Dependency Graph

```
@osndot/osn (CLI core)
  ├── commander        -- CLI argument parsing
  ├── chalk            -- Terminal styling
  ├── ora              -- Spinner indicators
  ├── inquirer         -- Interactive prompts
  ├── consola          -- Structured logging
  └── zod              -- Schema validation

@osndot/sdk (Plugin SDK)
  └── (no runtime dependencies)

@osndot/plugin-* (Official Plugins)
  └── @osndot/sdk      -- workspace dependency
```

## Core Modules

### CLI Entry Point (`cli.ts`)

The main entry point initializes Commander, registers core commands, discovers and registers plugin commands, sets up global flags (`--verbose`, `--debug`), and handles graceful shutdown with plugin cleanup.

Global flags adjust the log level via consola:
- Default: info level
- `--verbose`: includes verbose messages
- `--debug`: includes all debug output

### Configuration System (`config.ts`, `config-writer.ts`)

Configuration is stored at `.osn/project.json` and validated at load time using Zod schemas. The schema enforces:

- `name` (required string)
- `version` (string, defaults to `"0.1.0"`)
- `plugins` (array of `{ name, version?, config? }`)
- `tasks` (record of `{ command, description?, env?, dependsOn? }`)
- `runtime` (object with `nodeVersion`)

A companion JSON Schema file (`schemas/project.schema.json`) is distributed with the package for IDE support.

**Atomic writes**: All configuration mutations use `writeConfigSafe()`, which writes to a temporary file first and then atomically renames it to the target path. This prevents data corruption from concurrent writes or process crashes.

### Plugin Loader (`plugin-loader.ts`)

The plugin loader scans `node_modules/@osndot/plugin-*` for installed plugins. For each discovered package:

1. The module is dynamically imported via `import()`.
2. If the plugin uses async setup (`_setupPromise`), the loader awaits resolution before proceeding.
3. The plugin structure is validated (must have a `name` property).
4. The `onLoad` lifecycle hook is called if defined.
5. Plugin commands are collected and registered as CLI subcommands.

### Task Runner (`run.ts`)

The task runner resolves and executes tasks from `project.json`:

1. Load configuration and validate with Zod.
2. Load all installed plugins.
3. If the task is not found in config, search plugin commands as a fallback.
4. Resolve `dependsOn` dependencies recursively with cycle detection.
5. For each task (dependencies first, then target):
   - Call `onBeforeTask` hooks on all plugins.
   - Execute the shell command with merged environment variables.
   - Call `onAfterTask` hooks with the success/failure status.

Shell execution uses platform-aware detection: `cmd.exe` on Windows, `/bin/sh` on other platforms.

### Logger (`logger.ts`)

Structured logging built on consola with chalk formatting. Provides:

- Standard log methods: `info`, `warn`, `error`, `debug`, `success`
- `setLogLevel()`: adjusts verbosity at runtime based on CLI flags
- `printBanner()`: displays the styled OSN banner

## Plugin System

### Plugin Definition

Plugins are created using the `definePlugin()` factory function from `@osndot/sdk`:

```typescript
definePlugin({
  name: "@scope/plugin-name",
  version: "0.1.0",
  description: "Plugin description",
  setup(ctx) {
    return { commands: [...], hooks: {...} };
  },
});
```

### Sync and Async Setup

The `setup` function can be either synchronous or asynchronous:

- **Sync**: Returns commands and hooks directly. Applied immediately during plugin construction.
- **Async**: Returns a Promise. The result is deferred to `_setupPromise`, which the CLI plugin loader awaits before registering commands and hooks.

### Plugin Context

Each plugin receives a `PluginContext` with:

| Property | Type | Description |
|----------|------|-------------|
| `cwd` | `string` (getter) | Current working directory, dynamically resolved on each access |
| `config` | `Record<string, unknown>` | Plugin-specific configuration from `project.json` |
| `logger` | `Logger` | Logging utilities: `info`, `warn`, `error`, `debug`, `success` |

The `cwd` property uses a getter to always return the current `process.cwd()`, rather than capturing a stale value at import time.

### Lifecycle Hooks

| Hook | Signature | Trigger |
|------|-----------|---------|
| `onLoad` | `() => void \| Promise<void>` | Plugin is loaded by the CLI during startup |
| `onUnload` | `() => void \| Promise<void>` | CLI is shutting down (SIGINT, SIGTERM, process exit) |
| `onBeforeTask` | `(taskName: string) => void \| Promise<void>` | Before a task command is executed |
| `onAfterTask` | `(taskName: string, success: boolean) => void \| Promise<void>` | After a task completes, with success/failure status |

The `onUnload` hook is called during graceful shutdown. The CLI registers handlers for `SIGINT`, `SIGTERM`, and `beforeExit` to ensure cleanup runs.

### Command Registration

Plugin commands follow the `prefix:action` naming convention. The CLI extracts the prefix from the plugin name and maps commands to subcommands:

```
Plugin: @osndot/plugin-git
Command: git:status
CLI mapping: osn git status
```

### Plugin Validation

When a plugin is installed via `osn plugin add`, the CLI:

1. Installs the npm package using pnpm.
2. Attempts to dynamically import the package.
3. Validates that the default export contains a `name` property.
4. Reads the installed version from the package's `package.json`.
5. Registers the plugin with name and version in `project.json`.

If validation fails, a warning is displayed but the package remains installed.

## CI/CD

### Continuous Integration (`ci.yml`)

Triggered on push and pull requests to `main`. Runs on Node.js 20 and 22:
- Install dependencies
- Build all packages
- Lint all source files
- Type check all packages
- Run the test suite

### Release (`release.yml`)

Triggered by version tags (`v*`). Builds all packages and publishes to npm.

## Error Handling

- Core commands do not call `process.exit()` directly. Errors are thrown and caught by Commander's built-in error handling.
- Plugin hook failures are caught and logged as warnings without interrupting task execution.
- Configuration validation errors provide detailed Zod error messages.
- The CLI catches unhandled errors at the top level with proper cleanup.

## File Structure

```
osn/
├── packages/
│   ├── osn/
│   │   ├── src/
│   │   │   ├── cli.ts                  # Entry point
│   │   │   ├── index.ts                # Public API
│   │   │   ├── commands/
│   │   │   │   ├── init.ts             # osn init
│   │   │   │   ├── run.ts              # osn run
│   │   │   │   ├── plugin.ts           # osn plugin
│   │   │   │   └── info.ts             # osn info
│   │   │   ├── core/
│   │   │   │   ├── config.ts           # Zod schema + loader
│   │   │   │   ├── config-writer.ts    # Atomic config writes
│   │   │   │   ├── constants.ts        # Shared constants (OSN_DIR, CONFIG_FILE)
│   │   │   │   ├── plugin-loader.ts    # Dynamic plugin discovery
│   │   │   │   └── plugin-registry.ts  # In-memory plugin singleton registry
│   │   │   └── utils/
│   │   │       ├── logger.ts           # Consola + Chalk logger
│   │   │       └── shell.ts            # Platform-aware shell options
│   │   ├── schemas/
│   │   │   └── project.schema.json     # JSON Schema for project.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   ├── sdk/
│   │   └── src/
│   │       ├── define-plugin.ts        # definePlugin factory
│   │       ├── types.ts                # Type definitions
│   │       └── index.ts                # Public API
│   ├── plugin-git/
│   ├── plugin-docker/
│   └── plugin-env/
├── docs/
├── .github/workflows/
├── eslint.config.js
├── .prettierrc
├── tsconfig.base.json
└── pnpm-workspace.yaml
```