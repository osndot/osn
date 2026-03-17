import { describe, it, expect } from "vitest";
import type { OsnPlugin } from "@osndot/sdk";
import plugin from "../index.js";

describe("@osndot/plugin-env", () => {
    it("should have correct metadata", () => {
        expect(plugin.name).toBe("@osndot/plugin-env");
        expect(plugin.version).toBe("0.2.0");
        expect(plugin.description).toBe("Environment configuration management for OSN");
    });

    it("should register env:list and env:init commands", () => {
        expect(plugin.commands).toBeDefined();
        expect(plugin.commands).toHaveLength(2);

        const commandNames = plugin.commands!.map((c) => c.name);
        expect(commandNames).toContain("env:list");
        expect(commandNames).toContain("env:init");
    });

    it("should provide descriptions for all commands", () => {
        for (const cmd of plugin.commands!) {
            expect(cmd.description).toBeTruthy();
        }
    });

    it("should have _setConfig function from SDK", () => {
        expect(typeof (plugin as OsnPlugin)._setConfig).toBe("function");
    });

    it("should have handlers for all commands", () => {
        for (const cmd of plugin.commands!) {
            expect(typeof cmd.handler).toBe("function");
        }
    });

    it("should have onLoad lifecycle hook", () => {
        expect(plugin.onLoad).toBeDefined();
        expect(typeof plugin.onLoad).toBe("function");
    });
});
