import { writeFile, rename, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Atomically write JSON data to a config file.
 * Writes to a temp file first, then renames to prevent corruption
 * from concurrent writes or process crashes.
 */
export async function writeConfigSafe(
    configPath: string,
    data: unknown
): Promise<void> {
    const content = JSON.stringify(data, null, 2) + "\n";
    const dir = dirname(configPath);
    const tempPath = join(dir, `.project.json.${randomUUID().slice(0, 8)}.tmp`);

    try {
        // Write to temp file first
        await writeFile(tempPath, content, "utf-8");
        // Atomically replace the target file
        await rename(tempPath, configPath);
    } catch (error) {
        // Cleanup temp file if rename failed
        try {
            await unlink(tempPath);
        } catch {
            // Temp file may not exist, ignore
        }
        throw error;
    }
}
