import { definePlugin } from "@osndot/sdk";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export default definePlugin({
    name: "@osndot/plugin-docker",
    version: "0.1.0",
    description: "Docker integration for OSN",
    setup(ctx) {
        return {
            commands: [
                {
                    name: "docker:ps",
                    description: "List running Docker containers",
                    handler: async () => {
                        try {
                            const { stdout } = await execAsync("docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'", {
                                cwd: ctx.cwd,
                            });
                            if (stdout.trim()) {
                                ctx.logger.info(stdout.trim());
                            } else {
                                ctx.logger.info("No running containers.");
                            }
                        } catch {
                            ctx.logger.error("Docker is not installed or not running.");
                        }
                    },
                },
                {
                    name: "docker:build",
                    description: "Build Docker image from Dockerfile",
                    handler: async () => {
                        try {
                            ctx.logger.info("Building Docker image...");
                            const { stdout } = await execAsync("docker build -t osn-app .", {
                                cwd: ctx.cwd,
                            });
                            ctx.logger.info(stdout.trim());
                            ctx.logger.success("Docker image built successfully.");
                        } catch (error) {
                            ctx.logger.error("Docker build failed.");
                        }
                    },
                },
            ],
            hooks: {
                onLoad: () => ctx.logger.debug("Docker plugin loaded."),
            },
        };
    },
});
