import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-black">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white/95 mb-4">
          Ready to try osn?
        </h2>
        <p className="text-white/50 text-sm sm:text-base mb-10">
          Plugin-driven CLI and task runner for modern TypeScript projects.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/docs"
            className="rounded-lg bg-amber-500/20 text-amber-400 px-5 py-2.5 text-sm font-medium hover:bg-amber-500/30 transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/osndot/osn"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
