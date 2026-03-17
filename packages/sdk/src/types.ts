// ─── Plugin Types ───

/**
 * Represents a command that a plugin registers with the OSN CLI.
 */
export interface PluginCommand {
    /** Command name (e.g. "status", "build") */
    name: string;
    /** Human-readable description */
    description?: string;
    /** Command arguments definition */
    arguments?: PluginCommandArgument[];
    /** Command options definition */
    options?: PluginCommandOption[];
    /** The handler function invoked when the command is executed */
    handler: (args?: Record<string, unknown>) => Promise<void> | void;
    /** @internal Used by CLI core to trace commands back to their plugin */
    pluginName?: string;
}

export interface PluginCommandArgument {
    name: string;
    description?: string;
    required?: boolean;
    defaultValue?: string;
}

export interface PluginCommandOption {
    flags: string;
    description?: string;
    defaultValue?: unknown;
}

/**
 * Lifecycle hooks that a plugin can implement.
 */
export interface LifecycleHooks {
    /** Called when the plugin is loaded */
    onLoad?: () => Promise<void> | void;
    /** Called when the plugin is unloaded */
    onUnload?: () => Promise<void> | void;
    /** Called before a task is executed */
    onBeforeTask?: (taskName: string) => Promise<void> | void;
    /** Called after a task completes */
    onAfterTask?: (taskName: string, success: boolean) => Promise<void> | void;
}

/**
 * Context provided to plugins at runtime.
 */
export interface PluginContext {
    /** Current working directory */
    cwd: string;
    /** Plugin-specific configuration from project.json */
    config: Record<string, unknown>;
    /** Logging utilities */
    logger: {
        info: (message: string, ...args: unknown[]) => void;
        warn: (message: string, ...args: unknown[]) => void;
        error: (message: string, ...args: unknown[]) => void;
        debug: (message: string, ...args: unknown[]) => void;
        success: (message: string, ...args: unknown[]) => void;
    };
}

/**
 * Full plugin definition returned by definePlugin().
 */
export interface OsnPlugin {
    /** Unique plugin name (e.g. "@osndot/plugin-git") */
    name: string;
    /** Plugin version */
    version?: string;
    /** Plugin description */
    description?: string;
    /** Commands registered by this plugin */
    commands?: PluginCommand[];
    /** Lifecycle hooks */
    onLoad?: LifecycleHooks["onLoad"];
    onUnload?: LifecycleHooks["onUnload"];
    onBeforeTask?: LifecycleHooks["onBeforeTask"];
    onAfterTask?: LifecycleHooks["onAfterTask"];
    /** @internal Used by CLI core to resolve async plugin setups */
    _setupPromise?: Promise<void>;
    /** @internal Used by CLI core to inject plugin config */
    _setConfig?: (config: Record<string, unknown>) => void;
}

/**
 * Options passed to definePlugin() by plugin authors.
 */
export interface DefinePluginOptions {
    name: string;
    version?: string;
    description?: string;
    setup: (context: PluginContext) => OsnPluginSetupResult | Promise<OsnPluginSetupResult>;
}

export interface OsnPluginSetupResult {
    commands?: PluginCommand[];
    hooks?: LifecycleHooks;
}
