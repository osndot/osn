import { createRequire } from "node:module";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { runCommand } from "./commands/run.js";
import { pluginCommand } from "./commands/plugin.js";
import { infoCommand } from "./commands/info.js";
import { loadPlugins } from "./core/plugin-loader.js";
import { loadConfig } from "./core/config.js";
import { setPlugins, getPlugins } from "./core/plugin-registry.js";
import { logger, setLogLevel, printBanner } from "./utils/logger.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

// Track loaded plugins for cleanup
let activePlugins = getPlugins();

program
    .name("osn")
    .description("OSN — Modern, plugin-driven developer runtime and CLI platform")
    .version(pkg.version, "-v, --version")
    .option("--verbose", "Enable verbose logging")
    .option("--debug", "Enable debug logging (most detailed)")
    .hook("preAction", (_thisCommand, actionCommand) => {
        const opts = actionCommand.optsWithGlobals();
        if (opts.debug) {
            setLogLevel("debug");
        } else if (opts.verbose) {
            setLogLevel("verbose");
        }
    });

// Register core commands
program.addCommand(initCommand);
program.addCommand(runCommand);
program.addCommand(pluginCommand);
program.addCommand(infoCommand);

// Global error handling
program.exitOverride();

/**
 * Discover and register plugin commands as CLI subcommands.
 * e.g. plugin "git" with command "status" → `osn git status`
 */
async function registerPluginCommands(): Promise<void> {
    try {
        const config = await loadConfig();
        const plugins = await loadPlugins(process.cwd(), config?.plugins);
        setPlugins(plugins);
        activePlugins = plugins;

        for (const plugin of plugins) {
            if (!plugin.commands || plugin.commands.length === 0) continue;

            // Extract prefix from plugin name: "@osndot/plugin-git" → "git"
            const prefix = plugin.name
                .replace("@osndot/plugin-", "")
                .replace(/^plugin-/, "");

            const pluginGroup = new Command(prefix)
                .description(`${plugin.description ?? plugin.name} commands`);

            for (const cmd of plugin.commands) {
                // Command name: "git:status" → "status", or keep as-is
                const cmdName = cmd.name.includes(":")
                    ? cmd.name.split(":").pop()!
                    : cmd.name;

                pluginGroup
                    .command(cmdName)
                    .description(cmd.description ?? "")
                    .action(async () => {
                        if (cmd.handler) {
                            await cmd.handler();
                        }
                    });
            }

            program.addCommand(pluginGroup);
        }
    } catch {
        // Plugin loading is best-effort — don't crash CLI
    }
}

/**
 * Call onUnload hooks on all active plugins.
 */
async function cleanupPlugins(): Promise<void> {
    for (const plugin of activePlugins) {
        if (plugin.onUnload) {
            try {
                await plugin.onUnload();
            } catch (err) {
                logger.debug(`Plugin ${plugin.name} onUnload failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    }
    activePlugins = [];
}

// ─── Graceful Shutdown Handlers ───

let cleanupDone = false;
async function handleExit(): Promise<void> {
    if (cleanupDone) return;
    cleanupDone = true;
    await cleanupPlugins();
}

process.on("beforeExit", () => {
    handleExit().catch((err) => {
        logger.debug(`Cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
    });
});

process.on("SIGINT", async () => {
    await handleExit();
    process.exit(130);
});

process.on("SIGTERM", async () => {
    await handleExit();
    process.exit(143);
});

async function main(): Promise<void> {
    try {
        // Show banner if not requesting help or version
        const args = process.argv.slice(2);
        const shouldShowBanner = !args.some(
            (a) => a === "-h" || a === "--help" || a === "-v" || a === "--version"
        );
        if (shouldShowBanner) {
            printBanner(pkg.version);
        }

        // Register plugin commands before parsing
        await registerPluginCommands();
        await program.parseAsync(process.argv);
    } catch (error: unknown) {
        // Commander throws CommanderError with specific codes for help/version display
        const commanderError = error as { code?: string };
        if (
            commanderError.code === "commander.helpDisplayed" ||
            commanderError.code === "commander.version"
        ) {
            process.exit(0);
        }

        if (error instanceof Error) {
            logger.error("An unexpected error occurred:", error.message);
        }
        process.exit(1);
    }
}

main();
