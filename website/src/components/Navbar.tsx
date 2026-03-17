"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "plugins", href: "/plugins" },
  { label: "community", href: "/community" },
  { label: "docs", href: "/docs" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-white/95 hover:text-white transition-colors"
        >
          <Image
            src="/logo.png"
            alt="osn."
            width={28}
            height={28}
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain mt-1 transition-transform duration-500 group-hover:rotate-[360deg]"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
          <span className="font-serif text-lg sm:text-xl font-medium tracking-tight">
            osn.
          </span>
        </Link>

        <div className="flex items-center gap-6 sm:gap-8">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/docs"
            className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/30 transition-colors backdrop-blur-xs"
          >
            Docs
          </Link>
          <a
            href="https://github.com/osndot/osn"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-3 py-1.5 text-sm text-black/90 hover:bg-white/70 transition-colors"
          >
            Github
          </a>
        </div>
      </nav>
    </header>
  );
}
