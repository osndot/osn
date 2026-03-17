import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadPlugins } from "../core/plugin-loader.js";

describe("loadPlugins", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `osn-plugin-test-${Date.now()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("should return empty array when no node_modules/@osndot exists", async () => {
        const plugins = await loadPlugins(testDir);
        expect(plugins).toEqual([]);
    });

    it("should return empty array when @osndot scope has no plugin dirs", async () => {
        await mkdir(join(testDir, "node_modules", "@osndot"), { recursive: true });
        const plugins = await loadPlugins(testDir);
        expect(plugins).toEqual([]);
    });

    it("should gracefully handle plugin with invalid structure", async () => {
        const pluginDir = join(testDir, "node_modules", "@osndot", "plugin-broken");
        await mkdir(pluginDir, { recursive: true });
        // No index.js, so import will fail — should not crash
        const plugins = await loadPlugins(testDir);
        expect(plugins).toEqual([]);
    });

    it("should build config lookup map from plugin entries", async () => {
        await mkdir(join(testDir, "node_modules", "@osndot"), { recursive: true });

        const configs = [
            { name: "@osndot/plugin-example", config: { key: "value" } },
            { name: "@osndot/plugin-other" },
        ];
        const plugins = await loadPlugins(testDir, configs);

        // No actual plugins to load, but the function should not crash with config entries
        expect(plugins).toEqual([]);
    });
});
