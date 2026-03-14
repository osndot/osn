# Getting Started

This guide covers installation, project initialization, and everyday usage of the OSN CLI.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Installation

```bash
# Global installation (recommended)
pnpm add -g @osndot/osn

# Or as a project-level dev dependency
pnpm add -D @osndot/osn
```

## Creating a Project

```bash
mkdir my-project && cd my-project
osn init
```

The interactive prompt asks for a project name and creates a `.osn/project.json` configuration file:

```json
{
  "$schema": "./node_modules/@osndot/osn/schemas/project.schema.json",
  "name": "my-project",
  "version": "0.1.0",
  "plugins": [],
  "tasks": {
    "dev": {
      "command": "echo \"No dev task configured\"",
      "description": "Start development server"
    },
    "build": {
      "command": "echo \"No build task configured\"",
      "description": "Build the project"
    }
  },
  "runtime": {
    "nodeVersion": ">=20.0.0"
  }
}
```

The `$schema` field enables autocomplete and inline validation in supported editors such as VS Code.

## Running Tasks

### Basic Execution

```bash
osn run dev
osn run build
```

### Silent Mode

Suppress command output:

```bash
osn run build --silent
```

### Task Environment Variables

Tasks can declare environment variables that are injected at runtime:

```json
{
  "tasks": {
    "build": {
      "command": "tsc && node build.js",
      "env": {
        "NODE_ENV": "production",
        "BUILD_TARGET": "es2022"
      }
    }
  }
}
```

These variables are merged with the current process environment. Task-level variables take precedence over existing values.

### Task Dependencies

Tasks can depend on other tasks using the `dependsOn` field. Dependencies are resolved and executed in order before the target task runs:

```json
{
  "tasks": {
    "clean": {
      "command": "rimraf dist"
    },
    "compile": {
      "command": "tsc",
      "dependsOn": ["clean"]
    },
    "build": {
      "command": "node bundle.js",
      "dependsOn": ["compile"]
    }
  }
}
```

Running `osn run build` executes: `clean` -> `compile` -> `build`.

Circular dependencies are detected automatically and reported as errors.

## Managing Plugins

### Install a Plugin

```bash
osn plugin add git
```

This installs the `@osndot/plugin-git` package, validates that it is a valid OSN plugin, reads its version from the installed package, and registers it in your project configuration.

Short names are automatically expanded:
- `git` becomes `@osndot/plugin-git`
- `plugin-docker` becomes `@osndot/plugin-docker`
- `@osndot/plugin-env` is used as-is

### List Installed Plugins

```bash
osn plugin list
```

Displays all registered plugins with their versions.

### Remove a Plugin

```bash
osn plugin remove git
```

Uninstalls the package and removes the entry from `project.json`.

### Using Plugin Commands

Installed plugins register their commands as CLI subcommands. The plugin name determines the command prefix:

```bash
osn git status       # @osndot/plugin-git -> git:status
osn git log          # @osndot/plugin-git -> git:log
osn docker ps        # @osndot/plugin-docker -> docker:ps
osn docker build     # @osndot/plugin-docker -> docker:build
osn env list         # @osndot/plugin-env -> env:list
osn env init         # @osndot/plugin-env -> env:init
```

## Project Information

```bash
osn info
```

Displays the project name, version, Node.js version requirement, installed plugins with versions, and all defined tasks.

## Logging Verbosity

By default, OSN shows standard information-level output. For troubleshooting or development, you can increase the logging detail:

```bash
# Verbose mode -- includes additional context
osn run build --verbose

# Debug mode -- includes all internal debug messages
osn run build --debug
```

These flags are global and apply to any command.

## CLI Reference

| Command | Description |
|---------|-------------|
| `osn init` | Initialize a new OSN project |
| `osn run <task>` | Execute a defined task |
| `osn run <task> --silent` | Execute with suppressed output |
| `osn plugin add <name>` | Install and register a plugin |
| `osn plugin list` | List installed plugins |
| `osn plugin remove <name>` | Remove a plugin |
| `osn info` | Display project information |
| `osn --verbose` | Enable verbose logging |
| `osn --debug` | Enable debug-level logging |
| `osn --version` | Show version |
| `osn --help` | Show all commands |

## Next Steps

- [Configuration Reference](./configuration.md) -- Full schema documentation
- [Plugin Development](./plugin-development.md) -- Build your own plugins
- [Architecture](./architecture.md) -- Understand the internal design
