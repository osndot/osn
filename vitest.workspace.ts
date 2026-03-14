import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "packages/osn",
    "packages/sdk",
    "packages/plugin-git",
    "packages/plugin-docker",
    "packages/plugin-env",
]);
