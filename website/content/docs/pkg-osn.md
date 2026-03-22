---
title: osn
description: The core osn. runtime package.
section: Packages
order: 1
---

<div align="center">
<picture>
  <img
    alt="osn. banner"
    src="https://github.com/osndot/osn/raw/main/packages/osn/assets/osn-banner.png"
    width="100%"
  />
</picture>
</div>

**osn.** is the core command-line interface and task runner for the osn platform. It provides the foundation for executing tasks, managing environment variables, and loading plugins.

## Installation

```bash
pnpm add -g @osndot/osn
```

## Usage

```bash
# Initialize a new project
osn init

# Run a task
osn run build

# Manage plugins
osn plugin add git
osn plugin list
```

## Documentation

For full documentation and advanced usage, visit the [main repository](https://github.com/osndot/osn#readme).