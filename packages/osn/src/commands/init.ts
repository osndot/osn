import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { writeConfigSafe } from "../core/config-writer.js";
import { OSN_DIR, CONFIG_FILE } from "../core/constants.js";
import { logger } from "../utils/logger.js";

interface InitOptions {
    name?: string;
    yes?: boolean;
}

export const initCommand = new Command("init")
    .description("Initialize a new OSN project in the current directory")
    .option("-n, --name <name>", "Project name")
    .option("-y, --yes", "Skip prompts and use defaults", false)
    .action(async (options: InitOptions) => {
        const cwd = process.cwd();
        const osnDir = join(cwd, OSN_DIR);
        const configPath = join(osnDir, CONFIG_FILE);

        // Check if already initialized
        if (existsSync(configPath)) {
            logger.warn("This directory already has an OSN project configuration.");
            logger.info(`Config found at: ${chalk.dim(configPath)}`);
            return;
        }

        const spinner = ora("Initializing OSN project...").start();

        try {
            // Determine project name
            let projectName = options.name;

            if (!projectName) {
                const dirName = resolve(cwd).split(/[\\/]/).pop() ?? "osn-project";

                if (!options.yes) {
                    // Stop spinner before interactive prompt
                    spinner.stop();
                    const { default: inquirer } = await import("inquirer");
                    const answers = await inquirer.prompt([
                        {
                            type: "input",
                            name: "name",
                            message: "Project name:",
                            default: dirName,
                        },
                    ]);
                    projectName = answers.name;
                    // Restart spinner after prompt
                    spinner.start("Initializing OSN project...");
                } else {
                    projectName = dirName;
                }
            }

            // Create .osn directory
            await mkdir(osnDir, { recursive: true });

            // Create project.json
            const config = {
                $schema: "./node_modules/@osndot/osn/schemas/project.schema.json",
                name: projectName,
                version: "0.1.0",
                plugins: [],
                tasks: {
                    dev: {
                        command: "echo \"No dev task configured\"",
                        description: "Start development server",
                    },
                    build: {
                        command: "echo \"No build task configured\"",
                        description: "Build the project",
                    },
                },
                runtime: {
                    nodeVersion: ">=20.0.0",
                },
            };

            await writeConfigSafe(configPath, config);

            spinner.succeed(chalk.green("OSN project initialized successfully!"));
            logger.info("");
            logger.info(`  ${chalk.bold("Project:")} ${projectName}`);
            logger.info(`  ${chalk.bold("Config:")}  ${chalk.dim(configPath)}`);
            logger.info("");
            logger.info(`  Run ${chalk.cyan("osn run dev")} to start developing.`);
            logger.info(`  Run ${chalk.cyan("osn --help")} for all available commands.`);
        } catch (error) {
            spinner.fail("Failed to initialize OSN project.");
            if (error instanceof Error) {
                logger.error(error.message);
            }
        }
    });
