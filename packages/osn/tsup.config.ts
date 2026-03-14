import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: { cli: "src/cli.ts" },
        format: ["esm"],
        dts: false,
        clean: true,
        sourcemap: true,
        target: "node20",
        banner: {
            js: "#!/usr/bin/env node",
        },
    },
    {
        entry: { index: "src/index.ts" },
        format: ["esm"],
        dts: true,
        clean: false,
        sourcemap: true,
        target: "node20",
    },
]);
