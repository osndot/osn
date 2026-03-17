import { definePlugin } from "@osndot/sdk";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export default definePlugin({
    name: "@osndot/plugin-git",
    version: "0.2.0",
    description: "Git integration for OSN",
    setup(ctx) {
        return {
            commands: [
                {
                    name: "git:status",
                    description: "Show git repository status",
                    handler: async () => {
                        try {
                            const { stdout } = await execAsync("git status --short", { cwd: ctx.cwd });
                            if (stdout.trim()) {
                                ctx.logger.info(stdout.trim());
                            } else {
                                ctx.logger.success("Working directory is clean.");
                            }
                        } catch {
                            ctx.logger.error("Not a git repository or git is not installed.");
                        }
                    },
                },
                {
                    name: "git:log",
                    description: "Show recent git commits",
                    handler: async () => {
                        try {
                            const { stdout } = await execAsync(
                                'git log --oneline -10 --pretty=format:"%h %s"',
                                { cwd: ctx.cwd }
                            );
                            ctx.logger.info(stdout.trim());
                        } catch {
                            ctx.logger.error("Failed to retrieve git log.");
                        }
                    },
                },
            ],
            hooks: {
                onLoad: () => ctx.logger.debug("Git plugin loaded."),
            },
        };
    },
});
