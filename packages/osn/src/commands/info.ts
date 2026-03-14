import { Command } from "commander";
import chalk from "chalk";
import { loadConfig } from "../core/config.js";
import { logger } from "../utils/logger.js";

export const infoCommand = new Command("info")
    .description("Display information about the current OSN project")
    .action(async () => {
        const config = await loadConfig();

        if (!config) {
            logger.warn("No OSN project found in this directory.");
            logger.info(`Run ${chalk.cyan("osn init")} to create one.`);
            return;
        }

        logger.info("");
        logger.info(chalk.bold.cyan("  ⚡ OSN Project Info"));
        logger.info(chalk.dim("  ─────────────────────────"));
        logger.info("");
        logger.info(`  ${chalk.bold("Name:")}     ${config.name}`);
        logger.info(`  ${chalk.bold("Version:")}  ${config.version}`);

        if (config.runtime?.nodeVersion) {
            logger.info(`  ${chalk.bold("Node:")}     ${chalk.dim(config.runtime.nodeVersion)}`);
        }

        // Plugins
        const plugins = config.plugins ?? [];
        logger.info("");
        logger.info(`  ${chalk.bold("Plugins:")}  ${plugins.length === 0 ? chalk.dim("none") : ""}`);
        for (const plugin of plugins) {
            const ver = plugin.version ? chalk.dim(` @${plugin.version}`) : "";
            logger.info(`    ${chalk.green("●")} ${plugin.name}${ver}`);
        }

        // Tasks
        const tasks = Object.entries(config.tasks ?? {});
        logger.info("");
        logger.info(`  ${chalk.bold("Tasks:")}    ${tasks.length === 0 ? chalk.dim("none") : ""}`);
        for (const [name, task] of tasks) {
            logger.info(`    ${chalk.yellow("▸")} ${chalk.cyan(name)} — ${chalk.dim(task.description ?? task.command)}`);
        }

        logger.info("");
    });

