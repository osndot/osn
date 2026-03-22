---
title: "@osndot/plugin-docker"
description: Docker integration for osn. applications.
section: Packages
order: 5
---

<div align="center">
<picture>
  <img
    alt="osn. plugin-docker"
    src="https://github.com/osndot/osn/raw/main/packages/plugin-docker/assets/osn-plugin-docker.png"
    width="100%"
  />
</picture>
</div>

Provides quick access to common Docker operations directly through the `osn` CLI.

## Installation

Install and register the plugin in your project using the `osn` CLI:

```bash
osn plugin add docker
```

## Commands

Once installed, the following commands are instantly available:

- `osn docker ps` - List currently running Docker containers.
- `osn docker build` - Build a Docker image using the configured `imageName` (defaults to `osn-app`).

## Documentation

For more information and the full command reference, visit the [main repository](https://github.com/osndot/osn).
