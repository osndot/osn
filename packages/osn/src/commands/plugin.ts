import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { loadConfig } from "../core/config.js";
import { writeConfigSafe } from "../core/config-writer.js";
import { logger } from "../utils/logger.js";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

const execAsync = promisify(exec);

/**
 * Get platform-appropriate shell options for exec.
 */
function getShellOptions(): { shell: string } {
    return { shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" };
}

export const pluginCommand = new Command("plugin")
    .description("Manage OSN plugins");

// ─── osn plugin list ───

pluginCommand
    .command("list")
    .alias("ls")
    .description("List installed OSN plugins")
    .action(async () => {
        const config = await loadConfig();

        if (!config) {
            logger.warn("No OSN project found in this directory.");
            logger.info(`Run ${chalk.cyan("osn init")} to create one.`);
            return;
        }

        const plugins = config.plugins ?? [];

        if (plugins.length === 0) {
            logger.info(chalk.dim("No plugins installed."));
            logger.info("");
            logger.info(`Add one with ${chalk.cyan("osn plugin add <name>")}`);
            return;
        }

        logger.info(chalk.bold("Installed plugins:\n"));
        for (const plugin of plugins) {
            const version = plugin.version ? chalk.dim(`@${plugin.version}`) : "";
            logger.info(`  ${chalk.green("●")} ${chalk.cyan(plugin.name)}${version}`);
        }
        logger.info(chalk.dim(`\n  ${plugins.length} plugin(s) installed.`));
    });

// ─── osn plugin add ───

pluginCommand
    .command("add")
    .argument("<name>", "Plugin name (e.g. @osndot/plugin-git or just git)")
    .description("Install an OSN plugin")
    .action(async (name: string) => {
        // Normalize plugin name
        const packageName = name.startsWith("@osndot/plugin-")
            ? name
            : name.startsWith("plugin-")
                ? `@osndot/${name}`
                : `@osndot/plugin-${name}`;

        const spinner = ora(`Installing ${chalk.cyan(packageName)}...`).start();

        try {
            await execAsync(`pnpm add ${packageName}`, {
                cwd: process.cwd(),
                ...getShellOptions(),
            });
            spinner.succeed(`${chalk.cyan(packageName)} installed successfully.`);

            // ─── FEAT-1: Validate plugin structure ───
            let isValidPlugin = false;
            try {
                const pluginModule = await import(packageName);
                const pluginDef = pluginModule.default ?? pluginModule;
                if (pluginDef && typeof pluginDef === "object" && pluginDef.name) {
                    isValidPlugin = true;
                }
            } catch {
                // Import may fail in monorepo context, still register
                isValidPlugin = true;
            }

            if (!isValidPlugin) {
                logger.warn(
                    `${chalk.yellow("⚠")} ${packageName} was installed but may not be a valid OSN plugin.`
                );
                logger.info(chalk.dim("  Expected a default export with a 'name' property."));
            }

            // ─── FEAT-6: Read plugin version from package.json ───
            let pluginVersion: string | undefined;
            try {
                const pkgPath = join(process.cwd(), "node_modules", ...packageName.split("/"), "package.json");
                const pkgContent = JSON.parse(await readFile(pkgPath, "utf-8"));
                pluginVersion = pkgContent.version;
            } catch {
                // Version detection is best-effort
            }

            // Update project.json to register plugin
            const config = await loadConfig();
            if (config) {
                const configPath = join(process.cwd(), ".osn", "project.json");
                const raw = JSON.parse(await readFile(configPath, "utf-8"));

                const alreadyExists = raw.plugins?.some(
                    (p: { name: string }) => p.name === packageName
                );

                if (!alreadyExists) {
                    raw.plugins = raw.plugins ?? [];
                    const entry: { name: string; version?: string } = { name: packageName };
                    if (pluginVersion) {
                        entry.version = pluginVersion;
                    }
                    raw.plugins.push(entry);
                    await writeConfigSafe(configPath, raw);
                    const versionInfo = pluginVersion ? chalk.dim(` @${pluginVersion}`) : "";
                    logger.info(`Plugin registered in ${chalk.dim(".osn/project.json")}${versionInfo}`);
                }
            }
        } catch (error) {
            spinner.fail(`Failed to install ${chalk.red(packageName)}.`);
            if (error instanceof Error) {
                logger.error(error.message);
            }
        }
    });

// ─── osn plugin remove ───

pluginCommand
    .command("remove")
    .alias("rm")
    .argument("<name>", "Plugin name to remove")
    .description("Remove an OSN plugin")
    .action(async (name: string) => {
        const packageName = name.startsWith("@osndot/plugin-")
            ? name
            : name.startsWith("plugin-")
                ? `@osndot/${name}`
                : `@osndot/plugin-${name}`;

        const spinner = ora(`Removing ${chalk.cyan(packageName)}...`).start();

        try {
            await execAsync(`pnpm remove ${packageName}`, {
                cwd: process.cwd(),
                ...getShellOptions(),
            });
            spinner.succeed(`${chalk.cyan(packageName)} removed successfully.`);

            // Update project.json to unregister plugin
            const config = await loadConfig();
            if (config) {
                const configPath = join(process.cwd(), ".osn", "project.json");
                const raw = JSON.parse(await readFile(configPath, "utf-8"));

                raw.plugins = (raw.plugins ?? []).filter(
                    (p: { name: string }) => p.name !== packageName
                );
                await writeConfigSafe(configPath, raw);
                logger.info(`Plugin removed from ${chalk.dim(".osn/project.json")}`);
            }
        } catch (error) {
            spinner.fail(`Failed to remove ${chalk.red(packageName)}.`);
            if (error instanceof Error) {
                logger.error(error.message);
            }
        }
    });

