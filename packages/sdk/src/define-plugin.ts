import type {
    DefinePluginOptions,
    OsnPlugin,
    PluginContext,
} from "./types.js";

/**
 * Factory function for creating OSN plugins.
 *
 * @example
 * ```ts
 * import { definePlugin } from "@osndot/sdk";
 *
 * export default definePlugin({
 *   name: "@osndot/plugin-git",
 *   version: "0.1.0",
 *   description: "Git integration for OSN",
 *   setup(ctx) {
 *     return {
 *       commands: [
 *         {
 *           name: "git:status",
 *           description: "Show git status",
 *           handler: async () => {
 *             ctx.logger.info("Running git status...");
 *           },
 *         },
 *       ],
 *       hooks: {
 *         onLoad: () => ctx.logger.debug("Git plugin loaded"),
 *       },
 *     };
 *   },
 * });
 * ```
 */
export function definePlugin(options: DefinePluginOptions): OsnPlugin {
    // Create a context with dynamic cwd getter (always returns current directory)
    const context: PluginContext = {
        get cwd() {
            return process.cwd();
        },
        config: {},
        logger: {
            info: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
            success: console.log,
        },
    };

    const plugin: OsnPlugin = {
        name: options.name,
        version: options.version,
        description: options.description,
        _setConfig(cfg: Record<string, unknown>) {
            // Update the context configuration when provided by OSN CLI
            context.config = cfg;
        },
    };

    /**
     * Apply setup result (commands + hooks) to the plugin object.
     */
    function applySetupResult(result: { commands?: OsnPlugin["commands"]; hooks?: Record<string, unknown> }): void {
        plugin.commands = result.commands;
        const hooks = (result.hooks ?? {}) as {
            onLoad?: () => Promise<void> | void;
            onUnload?: () => Promise<void> | void;
            onBeforeTask?: (taskName: string) => Promise<void> | void;
            onAfterTask?: (taskName: string, success: boolean) => Promise<void> | void;
        };
        plugin.onLoad = hooks.onLoad;
        plugin.onUnload = hooks.onUnload;
        plugin.onBeforeTask = hooks.onBeforeTask;
        plugin.onAfterTask = hooks.onAfterTask;
    }

    // Execute setup — handle both sync and async returns
    const setupResult = options.setup(context);

    if (setupResult && typeof setupResult === "object") {
        if ("then" in setupResult && typeof (setupResult as Promise<unknown>).then === "function") {
            // Async setup: defer resolution via _setupPromise
            plugin._setupPromise = (setupResult as Promise<{ commands?: OsnPlugin["commands"]; hooks?: Record<string, unknown> }>)
                .then((resolved) => {
                    applySetupResult(resolved);
                });
        } else {
            // Sync setup: apply immediately
            applySetupResult(setupResult as { commands?: OsnPlugin["commands"]; hooks?: Record<string, unknown> });
        }
    }

    return plugin;
}

