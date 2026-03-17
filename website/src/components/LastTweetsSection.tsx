"use client";

import { useEffect, useState } from "react";

type Tweet = {
  id: string;
  text: string;
  created_at: string;
  url: string;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return "";
  }
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    part.match(urlRegex) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-amber-400/90 hover:underline">
        {part}
      </a>
    ) : (
      part
    )
  );
}

export function LastTweetsSection() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    fetch("/api/tweets")
      .then((res) => res.json())
      .then((data) => {
        setTweets(data.tweets || []);
        setError(data.error || null);
        setUsername(data.username || "osndot");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-black">
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white/95 text-center mb-4">
        Last tweets
      </h2>
      <p className="text-white/50 text-sm sm:text-base text-center max-w-xl mx-auto mb-10 sm:mb-12">
        Latest from{" "}
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400/90 hover:underline"
        >
          @{username}
        </a>
      </p>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {error && !loading && tweets.length === 0 && (
        <div className="max-w-2xl mx-auto text-center text-white/50 text-sm py-8 px-6 rounded-[28px] border border-white/10 bg-white/5">
          {error === "Twitter API not configured" ? (
            <p>Set TWITTER_BEARER_TOKEN and TWITTER_USERNAME in .env.local to show tweets.</p>
          ) : error === "credits_depleted" ? (
            <p>
              Twitter API credits are depleted. Follow us on{" "}
              <a
                href={`https://twitter.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/90 hover:underline"
              >
                @{username}
              </a>{" "}
              for updates.
            </p>
          ) : (
            <p>Tweets could not be loaded. Try again later.</p>
          )}
        </div>
      )}

      {!loading && tweets.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {tweets.map((tweet) => (
            <a
              key={tweet.id}
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[28px] border border-white/15 bg-white/5 p-5 sm:p-6 text-left hover:bg-white/[0.07] hover:border-white/20 transition-colors"
            >
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-3">
                {linkify(tweet.text)}
              </p>
              <time className="text-white/40 text-xs">
                {formatDate(tweet.created_at)}
              </time>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
