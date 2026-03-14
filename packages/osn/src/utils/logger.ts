import { createConsola } from "consola";
import chalk from "chalk";

/**
 * Structured logger for OSN CLI using Consola + Chalk.
 */
export const logger = createConsola({
    fancy: true,
    formatOptions: {
        date: false,
        colors: true,
        compact: true,
    },
});

/**
 * Set the log level based on CLI flags.
 * - "verbose" (level 4): shows info + verbose messages
 * - "debug" (level 5): shows everything including debug
 */
export function setLogLevel(level: "verbose" | "debug"): void {
    if (level === "debug") {
        logger.level = 5;
    } else if (level === "verbose") {
        logger.level = 4;
    }
}

/**
 * Print a styled banner for the OSN CLI.
 */
export function printBanner(version: string): void {
    console.log("");
    console.log(
        chalk.bold.cyan("  ⚡ OSN") + chalk.dim(` v${version}`)
    );
    console.log(
        chalk.dim("  Modern, plugin-driven developer runtime")
    );
    console.log("");
}

