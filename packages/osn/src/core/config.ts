import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { z } from "zod";
import { OSN_DIR, CONFIG_FILE } from "./constants.js";

// ─── Zod Schemas ───

const taskDefinitionSchema = z.object({
    command: z.string().min(1, "Task command cannot be empty"),
    description: z.string().optional(),
    env: z.record(z.string()).optional(),
    dependsOn: z.array(z.string()).optional(),
});

const pluginEntrySchema = z.object({
    name: z.string().min(1, "Plugin name is required"),
    version: z.string().optional(),
    config: z.record(z.unknown()).optional(),
});

const runtimeConfigSchema = z.object({
    nodeVersion: z.string().optional(),
});

export const projectConfigSchema = z.object({
    $schema: z.string().optional(),
    name: z.string().min(1, "Project name is required"),
    version: z.string().default("0.1.0"),
    plugins: z.array(pluginEntrySchema).default([]),
    tasks: z.record(taskDefinitionSchema).default({}),
    runtime: runtimeConfigSchema.optional(),
});

// ─── Types ───

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type PluginEntry = z.infer<typeof pluginEntrySchema>;
export type TaskDefinition = z.infer<typeof taskDefinitionSchema>;

// ─── Config Loader ───

/**
 * Load and validate .osn/project.json from the current working directory.
 * Returns null if no config file exists.
 * Throws if the file exists but is invalid.
 */
export async function loadConfig(cwd?: string): Promise<ProjectConfig | null> {
    const basePath = cwd ?? process.cwd();
    const configPath = join(basePath, OSN_DIR, CONFIG_FILE);

    if (!existsSync(configPath)) {
        return null;
    }

    const raw = await readFile(configPath, "utf-8");

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error(
            `Failed to parse ${configPath}: Invalid JSON. Please check the file syntax.`
        );
    }

    const result = projectConfigSchema.safeParse(parsed);

    if (!result.success) {
        const issues = result.error.issues
            .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        throw new Error(
            `Invalid OSN project configuration in ${configPath}:\n${issues}`
        );
    }

    return result.data;
}
