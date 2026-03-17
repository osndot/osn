import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { logger } from "../utils/logger.js";
import type { OsnPlugin, PluginCommand } from "@osndot/sdk";
import type { PluginEntry } from "./config.js";

// ─── Types ───

/**
 * A loaded plugin with resolved commands and lifecycle hooks.
 * Re-exports the SDK OsnPlugin type for compatibility.
 */
export type LoadedPlugin = OsnPlugin;
export type { PluginCommand };

// ─── Plugin Loader ───

const PLUGIN_PREFIX = "@osndot/plugin-";
const OSNDOT_SCOPE = "@osndot";

/**
 * Discover and dynamically load all installed OSN plugins.
 * Scans node_modules/@osndot/plugin-* for valid plugins.
 * Supports both sync and async plugin setups.
 *
 * @param cwd - The base directory to scan from (defaults to process.cwd())
 * @param pluginConfigs - Optional plugin configurations from project.json
 */
export async function loadPlugins(
    cwd?: string,
    pluginConfigs?: PluginEntry[]
): Promise<LoadedPlugin[]> {
    const basePath = cwd ?? process.cwd();
    const scopePath = join(basePath, "node_modules", OSNDOT_SCOPE);
    const loadedPlugins: LoadedPlugin[] = [];

    // If @osndot scope directory doesn't exist, no plugins are installed
    if (!existsSync(scopePath)) {
        return loadedPlugins;
    }

    // Build config lookup map
    const configMap = new Map<string, Record<string, unknown>>();
    if (pluginConfigs) {
        for (const entry of pluginConfigs) {
            if (entry.config) {
                configMap.set(entry.name, entry.config as Record<string, unknown>);
            }
        }
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

                    // Inject plugin-specific config if available
                    if (pluginDef._setConfig && configMap.has(pluginPackageName)) {
                        pluginDef._setConfig(configMap.get(pluginPackageName)!);
                    }

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
