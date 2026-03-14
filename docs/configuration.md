# Configuration Reference

Complete reference for the `.osn/project.json` configuration file.

## Overview

Every OSN project has a configuration file at `.osn/project.json`. This file is created by `osn init` and managed by the CLI. It is validated at runtime using Zod schemas, ensuring that invalid configurations are caught immediately with clear error messages.

A JSON Schema file is distributed with the `@osndot/osn` package for IDE autocomplete and validation support.

## Full Schema

```json
{
  "$schema": "./node_modules/@osndot/osn/schemas/project.schema.json",
  "name": "my-project",
  "version": "0.1.0",
  "plugins": [
    {
      "name": "@osndot/plugin-git",
      "version": "0.1.0"
    }
  ],
  "tasks": {
    "dev": {
      "command": "node server.js",
      "description": "Start the development server"
    },
    "build": {
      "command": "tsc && node build.js",
      "description": "Compile and bundle",
      "dependsOn": ["clean"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "clean": {
      "command": "rimraf dist",
      "description": "Remove build artifacts"
    }
  },
  "runtime": {
    "nodeVersion": ">=20.0.0"
  }
}
```

## Fields

### `$schema`

| | |
|---|---|
| Type | `string` |
| Required | No |
| Default | None |

Path or URL to the JSON Schema file. Used by editors for autocomplete and validation. The recommended value is:

```
"./node_modules/@osndot/osn/schemas/project.schema.json"
```

### `name`

| | |
|---|---|
| Type | `string` |
| Required | Yes |
| Constraints | Minimum length: 1 |

The project name. Set during `osn init`.

### `version`

| | |
|---|---|
| Type | `string` |
| Required | No |
| Default | `"0.1.0"` |

The project version. Follows semantic versioning conventions.

### `plugins`

| | |
|---|---|
| Type | `Array<PluginEntry>` |
| Required | No |
| Default | `[]` |

List of installed OSN plugins. Managed automatically by `osn plugin add` and `osn plugin remove`.

Each entry has the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | The npm package name of the plugin |
| `version` | `string` | No | The installed version, recorded at install time |
| `config` | `object` | No | Plugin-specific configuration passed to the plugin context |

Example:

```json
"plugins": [
  {
    "name": "@osndot/plugin-git",
    "version": "0.1.0"
  },
  {
    "name": "@osndot/plugin-env",
    "version": "0.1.0",
    "config": {
      "defaultFile": ".env.local"
    }
  }
]
```

### `tasks`

| | |
|---|---|
| Type | `Record<string, TaskDefinition>` |
| Required | No |
| Default | `{}` |

A map of task names to their definitions. Task names are used as the argument to `osn run`.

Each task definition has the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | `string` | Yes | The shell command to execute |
| `description` | `string` | No | Human-readable description displayed in `osn info` and error output |
| `env` | `Record<string, string>` | No | Environment variables injected during execution |
| `dependsOn` | `string[]` | No | Task names that must complete before this task runs |

#### `command`

The shell command is executed in the current working directory. On Windows, the command runs in `cmd.exe`. On other platforms, it runs in `/bin/sh`.

```json
"build": {
  "command": "tsc --project tsconfig.build.json"
}
```

#### `description`

Optional but recommended. Displayed by `osn info` and in error messages when a task is not found.

#### `env`

Environment variables are merged with the current process environment. Task-defined values take precedence:

```json
"test": {
  "command": "vitest run",
  "env": {
    "NODE_ENV": "test",
    "CI": "true"
  }
}
```

At runtime, the effective environment is `{ ...process.env, ...task.env }`.

#### `dependsOn`

An ordered list of task names that must run before this task. Dependencies are resolved recursively:

```json
"tasks": {
  "clean": { "command": "rimraf dist" },
  "compile": { "command": "tsc", "dependsOn": ["clean"] },
  "bundle": { "command": "rollup -c", "dependsOn": ["compile"] }
}
```

Running `osn run bundle` executes: `clean` then `compile` then `bundle`.

Each dependency runs at most once per invocation, even if referenced by multiple tasks. Circular dependencies are detected and result in an error:

```
Error: Circular dependency detected: build -> compile -> build
```

### `runtime`

| | |
|---|---|
| Type | `object` |
| Required | No |

Runtime configuration for the project.

| Field | Type | Description |
|-------|------|-------------|
| `nodeVersion` | `string` | Required Node.js version as a semver range |

Example:

```json
"runtime": {
  "nodeVersion": ">=20.0.0"
}
```

## Validation

The configuration file is validated every time it is loaded. Validation is performed using Zod, which provides detailed error messages:

- Missing required fields are reported by name.
- Type mismatches include the expected and received types.
- Constraint violations (e.g., empty strings where minimum length is 1) are described clearly.

If the file is missing, commands that require configuration (such as `osn run` and `osn info`) display a warning and suggest running `osn init`.

If the file contains invalid JSON, the error message includes the JSON parse error details.

## Atomic Writes

All mutations to `project.json` (from `osn init`, `osn plugin add`, and `osn plugin remove`) use atomic writes:

1. Content is written to a temporary file in the same directory.
2. The temporary file is atomically renamed to `project.json`.

This prevents file corruption from concurrent writes or unexpected process termination.

## IDE Support

The JSON Schema file at `schemas/project.schema.json` provides:

- Field autocompletion in editors that support JSON Schema (VS Code, WebStorm, etc.)
- Inline documentation for each field
- Type validation highlighting for incorrect values
- Enum suggestions where applicable

To enable this, include the `$schema` field in your `project.json`, or configure your editor to associate `.osn/project.json` files with the schema.
