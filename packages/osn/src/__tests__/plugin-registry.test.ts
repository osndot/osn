import { describe, it, expect, beforeEach } from "vitest";
import { getPlugins, setPlugins, clearPlugins, hasPlugins } from "../core/plugin-registry.js";
import type { LoadedPlugin } from "../core/plugin-loader.js";

describe("plugin-registry", () => {
    beforeEach(() => {
        clearPlugins();
    });

    it("should initially be empty", () => {
        expect(getPlugins()).toEqual([]);
        expect(hasPlugins()).toBe(false);
    });

    it("should store and retrieve plugins", () => {
        const mockPlugins = [{ name: "test-plugin" }] as LoadedPlugin[];
        setPlugins(mockPlugins);
        
        expect(hasPlugins()).toBe(true);
        expect(getPlugins()).toEqual(mockPlugins);
        // It should hold the same reference
        expect(getPlugins()).toBe(mockPlugins);
    });

    it("should clear stored plugins", () => {
        setPlugins([{ name: "test-plugin" }] as LoadedPlugin[]);
        clearPlugins();
        
        expect(hasPlugins()).toBe(false);
        expect(getPlugins()).toEqual([]);
    });
});
