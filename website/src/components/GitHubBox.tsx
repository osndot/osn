"use client";

import { useEffect, useState } from "react";

type Commit = {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  url: string;
  author: { name: string; login: string; avatarUrl: string };
};

type Contributor = {
  login: string;
  avatarUrl: string;
  url: string;
};

export function GitHubBox() {
  const [commit, setCommit] = useState<Commit | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github")
      .then((res) => res.json())
      .then((data) => {
        setCommit(data.lastCommit ?? null);
        setContributors(data.contributors ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-[28px] border border-white/15 bg-white/5 p-5 sm:p-6 min-w-[220px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-white/90"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <span className="font-serif text-sm font-medium text-white/90">
          GitHub
        </span>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {!loading && (
        <>
          {commit && (
            <div className="mb-4">
              <p className="text-white/50 text-xs mb-1">Last commit</p>
              <a
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 text-xs hover:text-amber-400/90 transition-colors line-clamp-2 block"
                title={commit.message}
              >
                {commit.message}
              </a>
              <p className="text-white/40 text-[10px] mt-1">{commit.shortSha}</p>
            </div>
          )}

          {contributors.length > 0 && (
            <div>
              <p className="text-white/50 text-xs mb-2">Contributors</p>
              <div className="flex -space-x-2">
                {contributors.slice(0, 8).map((c) => (
                  <a
                    key={c.login}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-8 w-8 rounded-full border-2 border-black bg-white/10 overflow-hidden hover:z-10 hover:ring-2 hover:ring-white/30 transition-all"
                    title={c.login}
                  >
                    <img
                      src={c.avatarUrl}
                      alt={c.login}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
