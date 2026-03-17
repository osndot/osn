"use client";

import { useState, useRef, useEffect } from "react";

const boxClass =
  "flex-1 min-w-[260px] max-w-[320px] rounded-[28px] border border-white/15 bg-white/5 py-6 px-4 sm:py-8 sm:px-5 flex flex-col";

const plugins = [
  { id: "git", name: "@osndot/plugin-git", desc: "Git status, log" },
  { id: "docker", name: "@osndot/plugin-docker", desc: "Containers, images" },
  { id: "env", name: "@osndot/plugin-env", desc: ".env management" },
];

const tasks = [
  { id: "build", name: "build", dependsOn: ["clean", "lint"] },
  { id: "dev", name: "dev", dependsOn: [] },
  { id: "deploy", name: "deploy", dependsOn: ["build"] },
];

export function FeatureBoxes() {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-5xl px-2 min-w-0">
      <PluginBox />
      <TaskRunnerBox />
      <LifecycleBox />
    </div>
  );
}

function useCloseOnClickOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [open, onClose]);
  return ref;
}

function PluginBox() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useCloseOnClickOutside(open, () => setOpen(false));

  const chosen = selected ? plugins.find((p) => p.id === selected) : null;

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        Plugin-driven CLI
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        Add plugins with one command. Git, Docker, env and your own.
      </p>
      <div className="mt-auto space-y-2" ref={ref}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full text-left rounded-lg bg-black/40 border border-white/15 px-3 py-2 font-mono text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            <span className="text-white/50">$ </span>
            osn plugin add{" "}
            <span className="text-amber-400/90">{chosen ? chosen.id : "…"}</span>
          </button>
          {open && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-white/15 bg-[#1a1a1a] shadow-lg overflow-hidden">
              {plugins.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(p.id);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 font-mono text-xs text-white/90 hover:bg-white/10 flex items-center justify-between"
                  >
                    {p.id}
                    <span className="text-white/40 text-[10px]">{p.desc}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {chosen && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 font-mono text-[11px] text-emerald-400/90">
            ✓ Added {chosen.name}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRunnerBox() {
  const [task, setTask] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useCloseOnClickOutside(open, () => setOpen(false));

  const selectedTask = task ? tasks.find((t) => t.id === task) : null;

  const runTask = () => {
    if (!selectedTask) return;
    setDone(false);
    setRunning(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => setRunning(false), 800);
    }, 1200);
  };

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        Task runner & dependencies
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        Chain tasks with dependsOn. Run one, run the graph.
      </p>
      <div className="mt-auto space-y-2" ref={ref}>
        <div className="flex gap-1 flex-wrap">
          <div className="relative flex-1 min-w-[100px]">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="w-full text-left rounded-lg bg-black/40 border border-white/15 px-3 py-2 font-mono text-xs text-white/90"
            >
              <span className="text-white/50">$ </span>
              osn run{" "}
              <span className="text-amber-400/90">
                {selectedTask ? selectedTask.name : "…"}
              </span>
            </button>
            {open && (
              <ul className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-white/15 bg-[#1a1a1a] shadow-lg overflow-hidden">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTask(t.id);
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 font-mono text-xs text-white/90 hover:bg-white/10"
                    >
                      {t.name}
                      {t.dependsOn.length > 0 && (
                        <span className="text-white/40 ml-1">
                          → {t.dependsOn.join(", ")}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={runTask}
            disabled={!selectedTask || running}
            className="rounded-lg bg-amber-500/20 text-amber-400 px-3 py-2 font-mono text-xs hover:bg-amber-500/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            Run
          </button>
        </div>
        {selectedTask && (
          <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 font-mono text-[11px] text-white/70 space-y-0.5">
            {running ? (
              <>
                <div className="text-white/50">
                  {selectedTask.dependsOn.length > 0
                    ? `Running: ${selectedTask.dependsOn.join(" → ")} → ${selectedTask.name}`
                    : `Running: ${selectedTask.name}`}
                </div>
                {done && <div className="text-emerald-400/80">✓ Done</div>}
              </>
            ) : (
              <div className="text-white/50">
                dependsOn: [{selectedTask.dependsOn.join(", ") || "—"}]
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LifecycleBox() {
  const [taskName, setTaskName] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const runWithHooks = () => {
    if (!taskName.trim()) return;
    setRunning(true);
    setLog([]);
    const t = taskName.trim();
    const lines = [
      `[onBeforeTask] ${t}`,
      `$ Running: ${t}`,
      `[onAfterTask] ${t} (success: true)`,
    ];
    lines.forEach((line, i) => {
      setTimeout(() => setLog((prev) => [...prev, line]), (i + 1) * 400);
    });
    setTimeout(() => setRunning(false), 1600);
  };

  return (
    <div className={boxClass}>
      <h3 className="font-serif text-white/95 text-sm sm:text-base font-medium mb-1">
        Lifecycle hooks
      </h3>
      <p className="text-white/60 text-xs sm:text-[13px] mb-4 leading-snug">
        Plugins hook into onBeforeTask, onAfterTask. One place to orchestrate.
      </p>
      <div className="mt-auto space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runWithHooks()}
            placeholder="Task name"
            className="flex-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2 font-mono text-xs text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="button"
            onClick={runWithHooks}
            disabled={running || !taskName.trim()}
            className="rounded-lg bg-amber-500/20 text-amber-400 px-3 py-2 font-mono text-xs hover:bg-amber-500/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            Run
          </button>
        </div>
        {log.length > 0 && (
          <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 font-mono text-[11px] text-white/70 space-y-0.5 max-h-20 overflow-y-auto">
            {log.map((line, i) => (
              <div key={i} className="text-white/60">
                {line.startsWith("$") ? (
                  <span className="text-amber-400/80">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
