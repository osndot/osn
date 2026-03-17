<div align="center">

# osn. website

  <a href="https://github.com/osndot/osn">
    <img alt="Official osn. project" src="https://img.shields.io/badge/Official%20osn.%20project-000000.svg?style=for-the-badge&labelColor=000">
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&labelColor=000">
  </a>
  <a href="https://nextjs.org/">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000.svg?style=for-the-badge&logo=next.js&logoColor=white&labelColor=000">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white&labelColor=000">
  </a>

</div>

<br />

Landing page and marketing site for **osn.** — modern, plugin-driven developer runtime. Built with Next.js (App Router), React, and Tailwind CSS.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (or npm / yarn)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Start

```bash
pnpm build
pnpm start
```

## Environment

Optional — for full functionality, create `.env.local` in the project root:

| Variable | Description |
|----------|-------------|
| `TWITTER_BEARER_TOKEN` | Twitter API v2 Bearer token (for “Last tweets” section) |
| `TWITTER_USERNAME` | Twitter username (default: `spaceownn`) |
| `GITHUB_TOKEN` | GitHub token (optional; improves API rate limit for repo info in footer) |

## Documentation

For the full **osn.** CLI, plugins, and SDK documentation, see the [main repository](https://github.com/osndot/osn).

## License

MIT
