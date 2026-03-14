import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { loadConfig } from "../core/config.js";
import { loadPlugins } from "../core/plugin-loader.js";
import { logger } from "../utils/logger.js";
import type { ProjectConfig } from "../core/config.js";
import type { LoadedPlugin } from "../core/plugin-loader.js";

const execAsync = promisify(exec);

/**
 * Get platform-appropriate shell options for exec.
 */
function getShellOptions(): { shell: string } {
    return { shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" };
}

/**
 * Resolve and execute task dependencies recursively.
 * Detects circular dependencies and throws on cycles.
 */
async function resolveDependencies(
    taskName: string,
    config: ProjectConfig,
    plugins: LoadedPlugin[],
    silent: boolean,
    visited: Set<string> = new Set(),
    stack: Set<string> = new Set()
): Promise<void> {
    if (stack.has(taskName)) {
        throw new Error(`Circular dependency detected: ${[...stack, taskName].join(" → ")}`);
    }
    if (visited.has(taskName)) return;

    stack.add(taskName);

    const task = config.tasks?.[taskName];
    if (task?.dependsOn) {
        for (const dep of task.dependsOn) {
            if (!config.tasks?.[dep]) {
                throw new Error(`Dependency task "${dep}" not found (required by "${taskName}")`);
            }
            await resolveDependencies(dep, config, plugins, silent, visited, stack);
            await executeTask(dep, config, plugins, silent);
            visited.add(dep);
        }
    }

    stack.delete(taskName);
}

/**
 * Execute a single task command with lifecycle hooks.
 */
async function executeTask(
    taskName: string,
    config: ProjectConfig,
    plugins: LoadedPlugin[],
    silent: boolean
): Promise<void> {
    const task = config.tasks?.[taskName];
    if (!task) return;

    // ─── Lifecycle: onBeforeTask ───
    for (const plugin of plugins) {
        if (plugin.onBeforeTask) {
            try {
                await plugin.onBeforeTask(taskName);
            } catch (err) {
                logger.warn(`Plugin ${plugin.name} onBeforeTask failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    }

    if (!silent) {
        logger.info(chalk.dim(`> ${task.command}`));
    }

    try {
        const { stdout, stderr } = await execAsync(task.command, {
            cwd: process.cwd(),
            env: { ...process.env, ...(task.env ?? {}) },
            ...getShellOptions(),
        });

        if (stdout && !silent) {
            process.stdout.write(stdout);
        }
        if (stderr && !silent) {
            process.stderr.write(stderr);
        }
    } catch (execError) {
        // Call onAfterTask hooks on failure
        for (const plugin of plugins) {
            if (plugin.onAfterTask) {
                try {
                    await plugin.onAfterTask(taskName, false);
                } catch {
                    // Swallow hook errors on failure path
                }
            }
        }
        throw execError;
    }

    // ─── Lifecycle: onAfterTask (success) ───
    for (const plugin of plugins) {
        if (plugin.onAfterTask) {
            try {
                await plugin.onAfterTask(taskName, true);
            } catch (err) {
                logger.warn(`Plugin ${plugin.name} onAfterTask failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    }
}

export const runCommand = new Command("run")
    .description("Run a task defined in .osn/project.json")
    .argument("<task>", "Task name to execute")
    .option("-s, --silent", "Suppress output", false)
    .action(async (taskName: string, options: { silent: boolean }) => {
        const spinner = ora(`Resolving task ${chalk.cyan(taskName)}...`).start();

        try {
            // Load project config
            const config = await loadConfig();

            if (!config) {
                spinner.fail("No OSN project found in this directory.");
                logger.info(`Run ${chalk.cyan("osn init")} to create one.`);
                return;
            }

            // Load plugins
            const plugins = await loadPlugins();

            // Check if task exists in project config
            const task = config.tasks?.[taskName];

            if (!task) {
                // Check plugin commands
                const pluginCmd = plugins
                    .flatMap((p) => p.commands ?? [])
                    .find((cmd) => cmd.name === taskName);

                if (pluginCmd) {
                    spinner.succeed(`Executing ${chalk.cyan(taskName)} (plugin: ${chalk.dim(pluginCmd.pluginName ?? "unknown")})`);
                    if (pluginCmd.handler) {
                        await pluginCmd.handler();
                    }
                    return;
                }

                spinner.fail(`Task ${chalk.red(taskName)} not found.`);
                logger.info("");
                logger.info("Available tasks:");
                if (config.tasks) {
                    for (const [name, def] of Object.entries(config.tasks)) {
                        logger.info(`  ${chalk.cyan(name)} — ${chalk.dim(def.description ?? "No description")}`);
                    }
                }
                return;
            }

            // ─── FEAT-8: Resolve task dependencies ───
            if (task.dependsOn && task.dependsOn.length > 0) {
                spinner.text = `Resolving dependencies for ${chalk.cyan(taskName)}...`;
                await resolveDependencies(taskName, config, plugins, options.silent);
                spinner.text = `Running task ${chalk.cyan(taskName)}...`;
            }

            // Execute the main task
            spinner.succeed(`Running task ${chalk.cyan(taskName)}`);

            await executeTask(taskName, config, plugins, options.silent);

            logger.success(`Task ${chalk.cyan(taskName)} completed.`);
        } catch (error) {
            spinner.fail(`Task ${chalk.red(taskName)} failed.`);
            if (error instanceof Error) {
                logger.error(error.message);
            }
        }
    });
