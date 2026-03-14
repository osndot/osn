import { describe, it, expect } from "vitest";
import { definePlugin } from "../define-plugin.js";
import type { OsnPlugin } from "../types.js";

describe("definePlugin", () => {
    it("should create a plugin with basic metadata", () => {
        const plugin = definePlugin({
            name: "@test/plugin-hello",
            version: "1.0.0",
            description: "A test plugin",
            setup() {
                return { commands: [], hooks: {} };
            },
        });

        expect(plugin.name).toBe("@test/plugin-hello");
        expect(plugin.version).toBe("1.0.0");
        expect(plugin.description).toBe("A test plugin");
    });

    it("should register commands from setup", () => {
        const handler = () => { };
        const plugin = definePlugin({
            name: "@test/plugin-cmd",
            setup() {
                return {
                    commands: [
                        {
                            name: "test:hello",
                            description: "Say hello",
                            handler,
                        },
                    ],
                    hooks: {},
                };
            },
        });

        expect(plugin.commands).toHaveLength(1);
        expect(plugin.commands![0].name).toBe("test:hello");
        expect(plugin.commands![0].description).toBe("Say hello");
        expect(plugin.commands![0].handler).toBe(handler);
    });

    it("should register lifecycle hooks from setup", () => {
        const onLoad = () => { };
        const onUnload = () => { };
        const onBeforeTask = () => { };
        const onAfterTask = () => { };

        const plugin = definePlugin({
            name: "@test/plugin-hooks",
            setup() {
                return {
                    commands: [],
                    hooks: { onLoad, onUnload, onBeforeTask, onAfterTask },
                };
            },
        });

        expect(plugin.onLoad).toBe(onLoad);
        expect(plugin.onUnload).toBe(onUnload);
        expect(plugin.onBeforeTask).toBe(onBeforeTask);
        expect(plugin.onAfterTask).toBe(onAfterTask);
    });

    it("should handle setup with no hooks", () => {
        const plugin = definePlugin({
            name: "@test/plugin-no-hooks",
            setup() {
                return { commands: [] };
            },
        });

        expect(plugin.onLoad).toBeUndefined();
        expect(plugin.onUnload).toBeUndefined();
    });

    it("should handle setup with empty commands", () => {
        const plugin = definePlugin({
            name: "@test/plugin-empty",
            setup() {
                return { commands: [], hooks: {} };
            },
        });

        expect(plugin.commands).toEqual([]);
    });

    it("should provide context with cwd and logger", () => {
        let receivedCwd = "";

        definePlugin({
            name: "@test/plugin-ctx",
            setup(ctx) {
                receivedCwd = ctx.cwd;
                expect(ctx.logger).toBeDefined();
                expect(typeof ctx.logger.info).toBe("function");
                expect(typeof ctx.logger.warn).toBe("function");
                expect(typeof ctx.logger.error).toBe("function");
                expect(typeof ctx.logger.debug).toBe("function");
                expect(typeof ctx.logger.success).toBe("function");
                return { commands: [], hooks: {} };
            },
        });

        expect(receivedCwd).toBeTruthy();
    });

    it("should satisfy OsnPlugin type", () => {
        const plugin: OsnPlugin = definePlugin({
            name: "@test/plugin-typed",
            version: "0.1.0",
            setup() {
                return { commands: [], hooks: {} };
            },
        });

        expect(plugin.name).toBe("@test/plugin-typed");
    });
});
