"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { label: "plugins", href: "/plugins" },
    { label: "community", href: "/community" },
    { label: "docs", href: "/docs" },
];

interface NavbarProps {
    showMenuButton?: boolean;
    onMenuToggle?: () => void;
    isMenuOpen?: boolean;
}
        export default function DocsNavbar({
        showMenuButton = false,
        onMenuToggle,
        isMenuOpen = false,
        }: NavbarProps) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-[128px]">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">

                <div className="flex items-center gap-3 min-w-0">

                    {showMenuButton && (
                        <button
                            onClick={onMenuToggle}
                            aria-label="menu"
                            className="hidden max-[900px]:flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-white/90"
                        >
                            <div className="flex flex-col gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className={`block h-[1.5px] w-[18px] bg-current rounded-full transition-all duration-200
                    ${isMenuOpen && i === 0 ? "translate-y-[5px] rotate-45" : ""}
                    ${isMenuOpen && i === 1 ? "scale-x-0" : ""}
                    ${isMenuOpen && i === 2 ? "-translate-y-[5px] -rotate-45" : ""}
                    `}
                                    />
                                ))}
                            </div>
                        </button>
                    )}

                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-white/95 hover:text-white transition-colors"
                    >
                        <Image
                            src="/logo.png"
                            alt="osn."
                            width={28}
                            height={28}
                            className="h-6 w-6 object-contain mt-1 transition-transform duration-500 group-hover:rotate-[360deg]"
                            style={{
                                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                        />
                        <span className="font-serif text-lg font-medium tracking-tight">
              osn.
            </span>
                    </Link>
                </div>

                <div className="hidden min-[900px]:flex items-center gap-8">
                    {navLinks.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            className={`text-sm transition-colors ${
                                pathname?.startsWith(href)
                                    ? "text-white"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="hidden min-[900px]:flex items-center gap-3">
                    <Link
                        href="/docs"
                        className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/30 transition backdrop-blur-xs"
                    >
                        Docs
                    </Link>

                    <a
                        href="https://github.com/osndot/osn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white px-3 py-1.5 text-sm text-black/90 hover:bg-white/80 transition"
                    >
                        Github
                    </a>
                </div>
            </nav>
        </header>
    );
}
