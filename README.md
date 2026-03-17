<div align="center">
<picture>
  <img
    alt="osn. banner"
    src="assets/osn-banner.png"
    width="100%"
  />
</picture>

<br />
<br />
<h4>Built in Public. Engineered for Impact.</h4>
<br />

  <a href="https://github.com/osndot">
    <img alt="Official osn. project" src="https://img.shields.io/badge/Official%20osn.%20project-000000.svg?style=for-the-badge&labelColor=000">
  </a>
  <a href="https://github.com/osndot">
    <img alt="Work In Progress" src="https://img.shields.io/badge/Work%20In%20Progress-000000.svg?style=for-the-badge&labelColor=000">
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&labelColor=000">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white&labelColor=000">
  </a>

</div>

<br />
<br />

**osn** is a modular command-line tool built for modern TypeScript projects. It provides a lightweight task runner, a powerful plugin system, and an extensible architecture designed for teams and individual developers alike.

## Features

- **Plugin-Driven Architecture** — Extend functionality through first-class plugins with lifecycle hooks, commands, and configuration support.
- **Task Runner** — Define, execute, and chain shell tasks with environment variable injection and dependency resolution.
- **Type-Safe Configuration** — Project configuration validated at runtime using Zod schemas, with full JSON Schema support for IDE autocomplete.
- **Cross-Platform** — Runs on macOS, Linux, and Windows with platform-aware shell execution.
- **Developer Experience** — Interactive project initialization, structured logging with adjustable verbosity, and clean error handling.

---

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# Install globally
pnpm add -g @osndot/osn

# Or use within a project
pnpm add -D @osndot/osn
```

### Initialize a Project

```bash
osn init
```

This creates a `.osn/project.json` configuration file with your project name, version, tasks, and plugin declarations.

### Define and Run Tasks

Edit `.osn/project.json` to define tasks:

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "tasks": {
    "clean": {
      "command": "rimraf dist",
      "description": "Remove build artifacts"
    },
    "build": {
      "command": "tsc",
      "description": "Compile TypeScript",
      "dependsOn": ["clean"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

```bash
osn run build
```

Tasks specified in `dependsOn` are executed automatically in order before the target task. Circular dependencies are detected and reported.

---

## Plugins

**osn.** ships with three official plugins:

| Plugin | Package | Description |
|--------|---------|-------------|
| Git | `@osndot/plugin-git` | Git status and log integration |
| Docker | `@osndot/plugin-docker` | Container listing and image builds |
| Environment | `@osndot/plugin-env` | `.env` file management |

### Managing Plugins

```bash
# Install a plugin
osn plugin add git

# List installed plugins
osn plugin list

# Remove a plugin
osn plugin remove git
```

Installed plugins are validated, versioned, and registered in your project configuration automatically.

### Using Plugin Commands

Once installed, plugin commands are available as CLI subcommands:

```bash
osn git status
osn docker ps
osn env list
```

### Plugin Configuration

You can provide configuration to plugins directly in `.osn/project.json`:

```json
{
  "plugins": [
    {
      "name": "@osndot/plugin-docker",
      "config": {
        "imageName": "my-custom-app-image"
      }
    }
  ]
}
```

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `osn init` | Initialize a new osn. project |
| `osn run <task>` | Execute a defined task |
| `osn plugin add <name>` | Install and register a plugin |
| `osn plugin list` | List installed plugins |
| `osn plugin remove <name>` | Remove a plugin |
| `osn info` | Display project information |
| `osn --verbose` | Enable verbose logging |
| `osn --debug` | Enable debug-level logging |
| `osn --version` | Show version |

---

## Developing Plugins

Plugins are npm packages that export a default plugin definition using the **osn.** SDK:

```typescript
import { definePlugin } from "@osndot/sdk";

export default definePlugin({
  name: "@osndot/plugin-example",
  version: "0.1.0",
  description: "An example plugin",
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
        onBeforeTask: (taskName) => ctx.logger.debug(`Before task: ${taskName}`),
        onAfterTask: (taskName, success) => ctx.logger.debug(`After task: ${taskName} (${success})`),
        onUnload: () => ctx.logger.debug("Plugin unloaded."),
      },
    };
  },
});
```

Both synchronous and asynchronous `setup` functions are supported. See the [Plugin Development Guide](docs/plugin-development.md) for full documentation.

---

## Project Structure

```
osn/
├── packages/
│   ├── osn/              # Core CLI application
│   ├── sdk/              # Plugin SDK and type definitions
│   ├── plugin-git/       # Official Git plugin
│   ├── plugin-docker/    # Official Docker plugin
│   └── plugin-env/       # Official Environment plugin
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD pipelines
└── eslint.config.js      # ESLint configuration
```

The project is organized as a monorepo managed with pnpm workspaces. Each package is independently versioned and publishable.

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

---

## License

This project is licensed under the [MIT License](LICENSE).
