import { describe, it, expect } from "vitest";
import { Command } from "commander";

describe("CLI commands registration", () => {
    it("should register init command", async () => {
        const { initCommand } = await import("../commands/init.js");
        expect(initCommand).toBeInstanceOf(Command);
        expect(initCommand.name()).toBe("init");
    });

    it("should register run command", async () => {
        const { runCommand } = await import("../commands/run.js");
        expect(runCommand).toBeInstanceOf(Command);
        expect(runCommand.name()).toBe("run");
    });

    it("should register plugin command with subcommands", async () => {
        const { pluginCommand } = await import("../commands/plugin.js");
        expect(pluginCommand).toBeInstanceOf(Command);
        expect(pluginCommand.name()).toBe("plugin");

        const subcommands = pluginCommand.commands.map((c) => c.name());
        expect(subcommands).toContain("list");
        expect(subcommands).toContain("add");
        expect(subcommands).toContain("remove");
    });

    it("should register info command", async () => {
        const { infoCommand } = await import("../commands/info.js");
        expect(infoCommand).toBeInstanceOf(Command);
        expect(infoCommand.name()).toBe("info");
    });

    it("init command should have -y option", async () => {
        const { initCommand } = await import("../commands/init.js");
        const yesOption = initCommand.options.find(
            (opt) => opt.short === "-y"
        );
        expect(yesOption).toBeDefined();
    });

    it("run command should accept task argument", async () => {
        const { runCommand } = await import("../commands/run.js");
        const args = runCommand.registeredArguments;
        expect(args).toHaveLength(1);
        expect(args[0].name()).toBe("task");
        expect(args[0].required).toBe(true);
    });
});
