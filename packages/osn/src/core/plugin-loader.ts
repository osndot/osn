import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { logger } from "../utils/logger.js";

// ─── Types ───

export interface PluginCommand {
    name: string;
    description?: string;
    pluginName?: string;
    handler?: () => Promise<void> | void;
}

export interface LoadedPlugin {
    name: string;
    version?: string;
    description?: string;
    commands?: PluginCommand[];
    onLoad?: () => Promise<void> | void;
    onUnload?: () => Promise<void> | void;
    onBeforeTask?: (taskName: string) => Promise<void> | void;
    onAfterTask?: (taskName: string, success: boolean) => Promise<void> | void;
}

// ─── Plugin Loader ───

const PLUGIN_PREFIX = "@osndot/plugin-";
const OSNDOT_SCOPE = "@osndot";

/**
 * Discover and dynamically load all installed OSN plugins.
 * Scans node_modules/@osndot/plugin-* for valid plugins.
 * Supports both sync and async plugin setups.
 */
export async function loadPlugins(cwd?: string): Promise<LoadedPlugin[]> {
    const basePath = cwd ?? process.cwd();
    const scopePath = join(basePath, "node_modules", OSNDOT_SCOPE);
    const loadedPlugins: LoadedPlugin[] = [];

    // If @osndot scope directory doesn't exist, no plugins are installed
    if (!existsSync(scopePath)) {
        return loadedPlugins;
    }

    try {
        const entries = await readdir(scopePath, { withFileTypes: true });
        const pluginDirs = entries
            .filter((entry) => (entry.isDirectory() || entry.isSymbolicLink()) && entry.name.startsWith("plugin-"))
            .map((entry) => entry.name);

        for (const dir of pluginDirs) {
            const pluginPackageName = `${PLUGIN_PREFIX}${dir.replace("plugin-", "")}`;

            try {
                // Dynamically import the plugin
                const pluginModule = await import(pluginPackageName);
                const pluginDef = pluginModule.default ?? pluginModule;

                // Await async setup if present
                if (pluginDef._setupPromise) {
                    await pluginDef._setupPromise;
                }

                if (pluginDef && typeof pluginDef === "object" && pluginDef.name) {
                    const plugin: LoadedPlugin = {
                        name: pluginDef.name,
                        version: pluginDef.version,
                        description: pluginDef.description,
                        commands: pluginDef.commands?.map((cmd: PluginCommand) => ({
                            ...cmd,
                            pluginName: pluginDef.name,
                        })),
                        onLoad: pluginDef.onLoad,
                        onUnload: pluginDef.onUnload,
                        onBeforeTask: pluginDef.onBeforeTask,
                        onAfterTask: pluginDef.onAfterTask,
                    };

                    // Call lifecycle hook
                    if (plugin.onLoad) {
                        await plugin.onLoad();
                    }

                    loadedPlugins.push(plugin);
                    logger.debug(`Loaded plugin: ${plugin.name}`);
                } else {
                    logger.warn(`Plugin ${pluginPackageName} has invalid structure, skipping.`);
                }
            } catch (error) {
                logger.warn(
                    `Failed to load plugin ${pluginPackageName}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    } catch (error) {
        logger.debug(
            `No plugins directory found: ${error instanceof Error ? error.message : String(error)}`
        );
    }

    return loadedPlugins;
}

