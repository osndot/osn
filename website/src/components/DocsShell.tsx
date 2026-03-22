"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DocsNavbar from "@/components/docsNavbar";
import DocsSidebar from "@/components/docsSidebar";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000" }}>
      <DocsNavbar
        showMenuButton
        isMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((current) => !current)}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          gap: "40px",
          padding: "0 clamp(16px, 3vw, 32px)",
        }}
      >
        <DocsSidebar />
        <DocsSidebar mobile open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            paddingTop: "clamp(20px, 4vw, 40px)",
            paddingBottom: "80px",
            maxWidth: "760px",
          }}
          className="docs-main"
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .docs-main {
            max-width: 100% !important;
            padding-bottom: 56px !important;
          }
        }
      `}</style>
    </div>
  );
}
