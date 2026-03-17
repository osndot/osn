import Link from "next/link";
import { GitHubBox } from "@/components/GitHubBox";

const col1 = [
  { label: "Docs", href: "/docs" },
  { label: "Plugins", href: "/plugins" },
  { label: "GitHub", href: "https://github.com/osndot/osn" },
];

const col2 = [
  { label: "Community", href: "/community" },
  { label: "Twitter", href: "https://twitter.com/spaceownn" },
];

export function Footer() {
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-12 sm:gap-16">
            <div>
              <h3 className="font-serif text-sm font-medium text-white/90 mb-4">
                Product
              </h3>
              <ul className="space-y-2.5">
                {col1.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("http") ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-white/90 mb-4">
                Community
              </h3>
              <ul className="space-y-2.5">
                {col2.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("http") ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <GitHubBox />
        </div>

        <div className="mt-12 pt-8 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} <a href="https://github.com/osndot" target="_blank" rel="noopener noreferrer" className="text-amber-400/90 hover:text-amber-400/70 transition-colors">osndot.</a> team - MIT License.
        </div>
      </div>
    </footer>
  );
}
