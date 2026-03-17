// ─── Shell Utilities ───

/**
 * Get platform-appropriate shell options for child_process.exec.
 * Uses cmd.exe on Windows and /bin/sh on Unix-like systems.
 */
export function getShellOptions(): { shell: string } {
    return { shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" };
}
