<div align="center">
<picture>
  <img
    alt="osn. sdk"
    src="assets/osn-sdk.png"
    width="100%"
  />
</picture>
</div>

## Installation

```bash
npm install -D @osndot/sdk
```

## Usage

Use the `definePlugin` factory function to create fully typed plugins for **osn.**:

```typescript
import { definePlugin } from "@osndot/sdk";

export default definePlugin({
  name: "my-custom-plugin",
  version: "1.0.0",
  description: "A custom plugin for osn",
  setup(ctx) {
    return {
      commands: [
        {
          name: "custom:hello",
          description: "Say hello",
          handler: () => {
             ctx.logger.info("Hello World!");
          }
        }
      ]
    };
  }
});
```

## Documentation

For complete documentation on building plugins, lifecycle hooks, and context management, see the [Plugin Development Guide](https://github.com/osndot/osn/blob/main/docs/plugin-development.md).

## License

MIT
