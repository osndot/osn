import { describe, it, expect } from "vitest";
import plugin from "../index.js";

describe("@osndot/plugin-docker", () => {
    it("should have correct metadata", () => {
        expect(plugin.name).toBe("@osndot/plugin-docker");
        expect(plugin.version).toBe("0.1.0");
        expect(plugin.description).toBe("Docker integration for OSN");
    });

    it("should register docker:ps and docker:build commands", () => {
        expect(plugin.commands).toBeDefined();
        expect(plugin.commands).toHaveLength(2);

        const commandNames = plugin.commands!.map((c) => c.name);
        expect(commandNames).toContain("docker:ps");
        expect(commandNames).toContain("docker:build");
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
