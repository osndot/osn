import type { LoadedPlugin } from "./plugin-loader.js";

// ─── Plugin Registry (Singleton) ───

/**
 * In-memory registry for loaded plugins.
 * Prevents duplicate loading between cli.ts and commands.
 */
let registeredPlugins: LoadedPlugin[] = [];

/**
 * Get currently loaded plugins from the registry.
 */
export function getPlugins(): LoadedPlugin[] {
    return registeredPlugins;
}

/**
 * Store loaded plugins in the registry.
 */
export function setPlugins(plugins: LoadedPlugin[]): void {
    registeredPlugins = plugins;
}

/**
 * Check if plugins have been loaded.
 */
export function hasPlugins(): boolean {
    return registeredPlugins.length > 0;
}

/**
 * Clear all plugins from the registry.
 */
export function clearPlugins(): void {
    registeredPlugins = [];
}
