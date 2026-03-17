"use client";

import { useState } from "react";

const boxClass =
  "rounded-[28px] border border-white/15 bg-white/5 py-6 px-4 sm:py-8 sm:px-5 flex flex-col min-w-0";

const configTabs = [
  { id: "tasks", label: "tasks", snippet: `"build": {
  "command": "tsc && node build.js",
  "dependsOn": ["clean", "lint"]
}` },
  { id: "plugins", label: "plugins", snippet: `{
  "name": "@osndot/plugin-git",
  "version": "0.2.0"
}` },
  { id: "runtime", label: "runtime", snippet: `{
  "nodeVersion": ">=20.0.0"
}` },
];

const cliCommands = [
  { cmd: "osn init", desc: "Create .osn/project.json" },
  { cmd: "osn run <task>", desc: "Run a task" },
  { cmd: "osn plugin add <name>", desc: "Install plugin" },
  { cmd: "osn plugin list", desc: "List installed" },
  { cmd: "osn plugin remove <name>", desc: "Remove plugin" },
];

const officialPlugins = [
  { name: "plugin-git", tag: "Git status, log" },
  { name: "plugin-docker", tag: "Containers, images" },
  { name: "plugin-env", tag: ".env files" },
];

const sdkSnippet = `definePlugin({
  name: "@you/plugin-name",
  setup(ctx) {
    ctx.registerCommand({
      name: "my:hello",
      run: () => ctx.logger.info("Hello")
    });
  }
});`;

export function OsnAreasSection() {
  return (
    <section className="pt-0 pb-20 sm:pb-28 px-4 sm:px-6 bg-black">
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white/95 text-center mb-4">
        areas of osn.
      </h2>
      <p className="text-white/50 text-sm sm:text-base text-center max-w-xl mx-auto mb-8 sm:mb-12">
        configuration, CLI, plugin ecosystem, and SDK in one platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
        <ConfigAreaBox />
        <CLIAreaBox />
        <PluginsAreaBox />
        <SDKAreaBox />
      </div>
    </section>
  );
}

function ConfigAreaBox() {
  const [tab, setTab] = useState("tasks");
  const current = configTabs.find((t) => t.id === tab) ?? configTabs[0];

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        Configuration
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        .osn/project.json — validated with Zod, single source of truth.
      </p>
      <div className="mt-auto space-y-2">
        <div className="flex gap-1 rounded-lg bg-black/40 p-1 border border-white/10">
          {configTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors ${
                tab === t.id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <pre className="rounded-lg bg-black/50 border border-white/10 p-3 font-mono text-[10px] sm:text-[11px] text-white/80 overflow-x-auto whitespace-pre">
          {current.snippet}
        </pre>
      </div>
    </div>
  );
}

function CLIAreaBox() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (cmd: string) => {
    void navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        CLI
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        One binary. init, run, plugin — all under osn.
      </p>
      <ul className="mt-auto space-y-1.5">
        {cliCommands.map(({ cmd, desc }) => (
          <li key={cmd} className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => copy(cmd)}
              className="rounded-md bg-black/40 border border-white/15 px-2.5 py-1.5 font-mono text-[11px] text-amber-400/90 hover:bg-white/10 transition-colors text-left flex-1 min-w-0"
            >
              {cmd}
            </button>
            <span className="text-white/40 text-[10px] flex-shrink-0">
              {desc}
            </span>
            {copied === cmd && (
              <span className="text-emerald-400/90 text-[10px]">Copied</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PluginsAreaBox() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        Plugin ecosystem
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        Official plugins and your own. Commands register automatically.
      </p>
      <ul className="mt-auto space-y-2">
        {officialPlugins.map(({ name, tag }) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === name ? null : name)}
              className="w-full text-left rounded-lg bg-black/40 border border-white/15 px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-mono text-xs text-white/90">
                @osndot/{name}
              </span>
              <span className="text-white/40 text-[10px]">{tag}</span>
            </button>
            {expanded === name && (
              <div className="mt-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 font-mono text-[11px] text-emerald-400/90">
                osn plugin add {name.replace("plugin-", "")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SDKAreaBox() {
  const [copied, setCopied] = useState(false);

  const copySnippet = () => {
    void navigator.clipboard.writeText(sdkSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        SDK & extensions
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        definePlugin for commands and hooks. Build your own plugin.
      </p>
      <div className="mt-auto relative">
        <pre className="rounded-lg bg-black/50 border border-white/10 p-3 font-mono text-[10px] sm:text-[11px] text-white/80 overflow-x-auto whitespace-pre pr-16">
          {sdkSnippet}
        </pre>
        <button
          type="button"
          onClick={copySnippet}
          className="absolute top-2 right-2 rounded-md bg-amber-500/20 text-amber-400 px-2 py-1 font-mono text-[10px] hover:bg-amber-500/30"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
