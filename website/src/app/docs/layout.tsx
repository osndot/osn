import Navbar from "@/components/docsNavbar";
import Sidebar from "@/components/docsSidebar";
import "./globals.css";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs">
      <Navbar />
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "40px", padding: "0 24px" }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, paddingTop: "40px", paddingBottom: "80px", maxWidth: "720px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}