<div align="center">
<picture>
  <img
    alt="osn. contributing"
    src="assets/osn-contributing.png"
    width="100%"
  />
</picture>
</div>

Thank you for considering a contribution to **osn.** This document outlines the process for contributing to the project, from setting up your development environment to submitting a pull request.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branch Strategy](#branch-strategy)
5. [Commit Conventions](#commit-conventions)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [Coding Standards](#coding-standards)
8. [Testing](#testing)
9. [Plugin Development](#plugin-development)
10. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/osndot/osn.git
   cd osn
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build all packages:
   ```bash
   pnpm build
   ```
5. Run the test suite to verify everything works:
   ```bash
   pnpm test
   ```

---

## Development Workflow

The project is structured as a monorepo using pnpm workspaces. All packages live under `packages/`:

| Package | Path | Description |
|---------|------|-------------|
| `@osndot/osn` | `packages/osn` | Core CLI application |
| `@osndot/sdk` | `packages/sdk` | Plugin SDK and type definitions |
| `@osndot/plugin-git` | `packages/plugin-git` | Official Git plugin |
| `@osndot/plugin-docker` | `packages/plugin-docker` | Official Docker plugin |
| `@osndot/plugin-env` | `packages/plugin-env` | Official Environment plugin |

### Common Commands

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Lint all source files
pnpm lint

# Format all source files
pnpm format

# Check formatting without modifying files
pnpm format:check
```

---

## Branch Strategy

- `main` — Stable release branch. Direct commits are not permitted.
- `dev` — Active development branch. Pull requests should target this branch.
- Feature branches — Use the naming convention `feature/<short-description>`.
- Bug fix branches — Use the naming convention `fix/<short-description>`.

---

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `test` | Adding or modifying tests |
| `chore` | Maintenance tasks (builds, CI, dependencies) |
| `perf` | Performance improvements |

### Scope

Use the package name without the `@osndot/` prefix: `osn`, `sdk`, `plugin-git`, `plugin-docker`, `plugin-env`.

### Examples

```
feat(osn): add task dependency resolution with cycle detection
fix(sdk): handle async setup functions in definePlugin
test(plugin-git): add unit tests for plugin structure
docs: update README with plugin development guide
```

---

## Submitting a Pull Request

1. Create a feature or fix branch from `dev`:
   ```bash
   git checkout -b feature/my-feature dev
   ```
2. Make your changes, following the coding standards below.
3. Add or update tests as needed.
4. Ensure all checks pass:
   ```bash
   pnpm build && pnpm test && pnpm typecheck && pnpm lint
   ```
5. Commit your changes using the conventional commit format.
6. Push to your fork and open a pull request against the `dev` branch.
7. Provide a clear description of the changes and reference any related issues.

### Pull Request Checklist

- [ ] Code follows the project's coding standards
- [ ] All existing tests pass
- [ ] New tests are added for new functionality
- [ ] TypeScript type checking passes without errors
- [ ] Linting passes without errors
- [ ] Documentation is updated if applicable

---

## Coding Standards

### TypeScript

- Strict mode is enabled. Do not use `any` unless absolutely necessary.
- Use `type` imports for type-only values (`import type { ... }`).
- Prefer `const` over `let`. Never use `var`.
- Use descriptive variable and function names.

### Formatting

The project uses Prettier for code formatting. Configuration is defined in `.prettierrc`:

- 4-space indentation
- Double quotes
- Trailing commas
- 120-character line width

Run `pnpm format` before committing to ensure consistent formatting.

### Linting

ESLint is configured with TypeScript support via `eslint.config.js`. Run `pnpm lint` to check for issues.

---

## Testing

Tests are written using [Vitest](https://vitest.dev/) and located alongside source files in `__tests__` directories.

### Running Tests

```bash
# All packages
pnpm test

# Specific package
cd packages/osn && pnpm test
```

### Writing Tests

- Place test files in `src/__tests__/` within the relevant package.
- Name test files `<module>.test.ts`.
- Test both success and failure paths.
- Mock external dependencies (file system, shell commands) where appropriate.

---

## Plugin Development

To create a new official plugin:

1. Create a new directory under `packages/plugin-<name>`.
2. Use the existing plugins as a reference for `package.json`, `tsconfig.json`, and `tsup.config.ts`.
3. Implement the plugin using `definePlugin` from `@osndot/sdk`.
4. Add the package to `pnpm-workspace.yaml`.
5. Write tests covering plugin structure and command behavior.

Refer to the [Plugin Development Guide](docs/plugin-development.md) for detailed instructions on the plugin API, lifecycle hooks, and context.

---

## Reporting Issues

If you encounter a bug or have a feature request, please open an issue on GitHub. Include the following information:

- A clear and descriptive title.
- Steps to reproduce the issue, if applicable.
- Expected behavior and actual behavior.
- Your environment: OS, Node.js version, pnpm version.
- Relevant logs or error messages.

For security vulnerabilities, please follow the process outlined in [SECURITY.md](SECURITY.md) instead of opening a public issue.
