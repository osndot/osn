import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig, projectConfigSchema } from "../core/config.js";

describe("projectConfigSchema", () => {
    it("should validate a minimal valid config", () => {
        const result = projectConfigSchema.safeParse({
            name: "test-project",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.name).toBe("test-project");
            expect(result.data.version).toBe("0.1.0");
            expect(result.data.plugins).toEqual([]);
            expect(result.data.tasks).toEqual({});
        }
    });

    it("should validate a full config", () => {
        const result = projectConfigSchema.safeParse({
            name: "my-app",
            version: "1.0.0",
            plugins: [{ name: "@osndot/plugin-git", version: "0.1.0" }],
            tasks: {
                dev: { command: "npm run dev", description: "Start dev server" },
                build: { command: "npm run build" },
            },
            runtime: { nodeVersion: ">=20.0.0" },
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.plugins).toHaveLength(1);
            expect(result.data.tasks.dev.command).toBe("npm run dev");
        }
    });

    it("should reject config without name", () => {
        const result = projectConfigSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject config with empty name", () => {
        const result = projectConfigSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
    });

    it("should reject task with empty command", () => {
        const result = projectConfigSchema.safeParse({
            name: "test",
            tasks: { dev: { command: "" } },
        });
        expect(result.success).toBe(false);
    });

    it("should reject plugin with empty name", () => {
        const result = projectConfigSchema.safeParse({
            name: "test",
            plugins: [{ name: "" }],
        });
        expect(result.success).toBe(false);
    });
});

describe("loadConfig", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `osn-test-${Date.now()}`);
        await mkdir(join(testDir, ".osn"), { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("should return null when no config exists", async () => {
        const emptyDir = join(tmpdir(), `osn-empty-${Date.now()}`);
        await mkdir(emptyDir, { recursive: true });
        const result = await loadConfig(emptyDir);
        expect(result).toBeNull();
        await rm(emptyDir, { recursive: true, force: true });
    });

    it("should load and validate a valid config", async () => {
        const config = {
            name: "test-project",
            version: "1.0.0",
            plugins: [],
            tasks: { dev: { command: "echo hello" } },
        };
        await writeFile(
            join(testDir, ".osn", "project.json"),
            JSON.stringify(config),
            "utf-8"
        );

        const result = await loadConfig(testDir);
        expect(result).not.toBeNull();
        expect(result!.name).toBe("test-project");
        expect(result!.tasks.dev.command).toBe("echo hello");
    });

    it("should throw on invalid JSON", async () => {
        await writeFile(
            join(testDir, ".osn", "project.json"),
            "{ invalid json }",
            "utf-8"
        );

        await expect(loadConfig(testDir)).rejects.toThrow("Invalid JSON");
    });

    it("should throw on invalid schema", async () => {
        await writeFile(
            join(testDir, ".osn", "project.json"),
            JSON.stringify({ version: "1.0.0" }),
            "utf-8"
        );

        await expect(loadConfig(testDir)).rejects.toThrow("Invalid OSN project configuration");
    });
});
