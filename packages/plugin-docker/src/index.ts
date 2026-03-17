import { definePlugin } from "@osndot/sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const VALID_IMAGE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._\-/:]*$/;

export default definePlugin({
    name: "@osndot/plugin-docker",
    version: "0.2.0",
    description: "Docker integration for OSN",
    setup(ctx) {
        return {
            commands: [
                {
                    name: "docker:ps",
                    description: "List running Docker containers",
                    handler: async () => {
                        try {
                            const { stdout } = await execFileAsync("docker", [
                                "ps", "--format", "{{.Names}}\t{{.Status}}\t{{.Ports}}",
                            ], { cwd: ctx.cwd });
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
                            const imageName = typeof ctx.config.imageName === "string"
                                ? ctx.config.imageName
                                : "osn-app";

                            if (!VALID_IMAGE_NAME.test(imageName)) {
                                ctx.logger.error(`Invalid Docker image name: ${imageName}`);
                                return;
                            }

                            ctx.logger.info(`Building Docker image (${imageName})...`);
                            const { stdout } = await execFileAsync("docker", [
                                "build", "-t", imageName, ".",
                            ], { cwd: ctx.cwd });
                            ctx.logger.info(stdout.trim());
                            ctx.logger.success("Docker image built successfully.");
                        } catch {
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
