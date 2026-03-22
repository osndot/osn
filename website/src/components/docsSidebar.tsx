"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SECTIONS = [
  {
    title: "Guide",
    items: [
      { label: "Getting Started", slug: "getting-started" },
      { label: "Architecture", slug: "architecture" },
      { label: "Plugin Development", slug: "plugin-development" },
      { label: "Configuration", slug: "configuration" },
    ],
  },
  {
    title: "Packages",
    items: [
      { label: "osn", slug: "pkg-osn" },
      { label: "@osndot/sdk", slug: "pkg-sdk" },
      { label: "@osndot/plugin-env", slug: "pkg-plugin-env" },
      { label: "@osndot/plugin-git", slug: "pkg-plugin-git" },
      { label: "@osndot/plugin-docker", slug: "pkg-plugin-docker" },
    ],
  },
];

function SidebarGroup({
  section,
  onNavigate,
}: {
  section: { title: string; items: { label: string; slug: string }[] };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: "24px" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 2px 0 8px",
        }}
      >
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {section.title}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
          {section.items.map((item) => {
            const href = `/docs/${item.slug}`;
            const active = pathname === href;

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  style={{
                    display: "block",
                    borderRadius: "8px",
                    padding: "6px 4px 6px 8px",
                    fontSize: "13.5px",
                    fontFamily: "var(--font-poppins), sans-serif",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    backgroundColor: active ? "rgba(245,158,11,0.14)" : "transparent",
                    color: active ? "#fbbf24" : "rgba(255,255,255,0.52)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {SECTIONS.map((section) => (
        <SidebarGroup key={section.title} section={section} onNavigate={onNavigate} />
      ))}
    </>
  );
}

interface SidebarProps {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function DocsSidebar({ mobile = false, open = false, onClose }: SidebarProps) {  if (mobile) {
    return (
      <>
        <div
          onClick={onClose}
          aria-hidden={!open}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.2s ease",
            zIndex: 59,
          }}
        />
        <aside
          id="docs-sidebar-mobile"
          aria-hidden={!open}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "min(86vw, 320px)",
            padding: "88px 20px 24px",
            background: "rgba(10,10,10,0.96)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.24s ease",
            zIndex: 60,
            overflowY: "auto",
          }}
        >
          <SidebarContent onNavigate={onClose} />
        </aside>
      </>
    );
  }

  return (
    <aside
      style={{
        width: "200px",
        flexShrink: 0,
        marginRight: "clamp(40px, 8vw, 128px)",
          marginLeft: "64px",
      }}
      className="docs-sidebar-desktop"
    >
      <div
        style={{
          position: "sticky",
          top: "72px",
          height: "calc(100vh - 72px)",
          overflowY: "auto",
          paddingTop: "32px",
          paddingRight: "0px",
          paddingBottom: "32px",
          paddingLeft: "0px",
        }}
      >
        <SidebarContent />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .docs-sidebar-desktop {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
