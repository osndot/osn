import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import plugin from "../index.js";

describe("@osndot/plugin-env", () => {
    it("should have correct metadata", () => {
        expect(plugin.name).toBe("@osndot/plugin-env");
        expect(plugin.version).toBe("0.1.0");
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
