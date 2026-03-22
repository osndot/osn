import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getDocBySlug, getAllDocs } from "@/lib/docs";
import type { Metadata } from "next";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const NAV_ORDER = [
  "getting-started",
  "architecture",
  "plugin-development",
  "configuration",
  "pkg-osn",
  "pkg-sdk",
  "pkg-plugin-env",
  "pkg-plugin-git",
  "pkg-plugin-docker",
];

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const currentIndex = NAV_ORDER.indexOf(slug);
  const prevSlug = currentIndex > 0 ? NAV_ORDER[currentIndex - 1] : null;
  const nextSlug =
    currentIndex < NAV_ORDER.length - 1 ? NAV_ORDER[currentIndex + 1] : null;
  const prevDoc = prevSlug ? getDocBySlug(prevSlug) : null;
  const nextDoc = nextSlug ? getDocBySlug(nextSlug) : null;

  return (
    <article style={{ maxWidth: "740px" }}>
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          color: "rgba(255,255,255,0.28)",
          marginBottom: "36px",
          fontFamily: "var(--font-poppins), sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        <Link
          href="/docs/getting-started"
          style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none" }}
        >
          Docs
        </Link>
        <span style={{ opacity: 0.35, userSelect: "none" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.36)" }}>{doc!.section}</span>
        <span style={{ opacity: 0.35, userSelect: "none" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>{doc!.title}</span>
      </nav>

      {/* Page Header */}
      <div style={{ marginBottom: "40px" }}>
        {/* Section label */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "rgba(245,158,11,0.6)",
            marginBottom: "16px",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "1.5px",
              background: "rgba(245,158,11,0.4)",
              borderRadius: "1px",
            }}
          />
          {doc!.section}
        </span>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1.18,
            marginBottom: "16px",
            marginTop: 0,
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {doc!.title}
        </h1>

        {doc!.description && (
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.48)",
              lineHeight: 1.72,
              margin: 0,
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 400,
              maxWidth: "560px",
            }}
          >
            {doc!.description}
          </p>
        )}
      </div>

      {/* Gradient divider */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)",
          marginBottom: "48px",
        }}
      />

      {/* MDX content */}
      <div className="prose prose-invert doc-prose" style={{ maxWidth: "none" }}>
        <style>{`
          .doc-prose {
            font-size: 15px;
            line-height: 1.78;
            color: rgba(255,255,255,0.65);
            font-family: var(--font-poppins), sans-serif;
          }

          /* Headings */
          .doc-prose h1 {
            font-size: 26px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.03em;
            line-height: 1.22;
            margin-top: 56px;
            margin-bottom: 14px;
          }
          .doc-prose h2 {
            font-size: 21px;
            font-weight: 600;
            color: rgba(255,255,255,0.92);
            letter-spacing: -0.025em;
            line-height: 1.3;
            margin-top: 48px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
          .doc-prose h3 {
            font-size: 17px;
            font-weight: 600;
            color: rgba(255,255,255,0.88);
            letter-spacing: -0.015em;
            line-height: 1.4;
            margin-top: 36px;
            margin-bottom: 10px;
          }
          .doc-prose h4 {
            font-size: 11px;
            font-weight: 600;
            color: rgba(255,255,255,0.45);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-top: 28px;
            margin-bottom: 8px;
          }

          /* Body */
          .doc-prose p {
            margin-top: 0;
            margin-bottom: 20px;
            color: rgba(255,255,255,0.65);
          }

          /* Inline code */
          .doc-prose code:not(pre code) {
            font-size: 12.5px;
            font-family: "JetBrains Mono", ui-monospace, monospace;
            color: rgba(251,191,36,0.9);
            background: rgba(251,191,36,0.08);
            border: 1px solid rgba(251,191,36,0.14);
            border-radius: 4px;
            padding: 1.5px 6px;
            font-weight: 400;
          }

          /* Code block */
          .doc-prose pre {
            background: rgba(255,255,255,0.035);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px;
            padding: 22px 24px;
            margin: 20px 0 28px;
            overflow-x: auto;
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-size: 13px;
            line-height: 1.72;
            color: rgba(255,255,255,0.8);
          }
          .doc-prose pre code {
            background: none;
            border: none;
            padding: 0;
            color: inherit;
            font-size: inherit;
          }

          /* Links */
          .doc-prose a {
            color: rgba(251,191,36,0.9);
            text-decoration: underline;
            text-decoration-color: rgba(251,191,36,0.28);
            text-underline-offset: 3px;
          }
          .doc-prose a:hover {
            color: #fbbf24;
            text-decoration-color: rgba(251,191,36,0.6);
          }

          /* Lists */
          .doc-prose ul, .doc-prose ol {
            padding-left: 22px;
            margin-bottom: 20px;
          }
          .doc-prose li {
            margin-bottom: 7px;
            color: rgba(255,255,255,0.65);
            line-height: 1.72;
          }
          .doc-prose ul li::marker { color: rgba(251,191,36,0.4); }
          .doc-prose ol li::marker { color: rgba(251,191,36,0.5); font-weight: 600; }

          /* Blockquote */
          .doc-prose blockquote {
            border-left: 2.5px solid rgba(251,191,36,0.3);
            margin: 24px 0;
            padding: 14px 20px;
            background: rgba(251,191,36,0.04);
            border-radius: 0 8px 8px 0;
            color: rgba(255,255,255,0.5);
            font-style: italic;
          }

          /* Tables */
          .doc-prose table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13.5px;
            margin: 24px 0 28px;
          }
          .doc-prose thead th {
            text-align: left;
            font-size: 10.5px;
            font-weight: 600;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.3);
            padding: 0 12px 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .doc-prose tbody td {
            padding: 11px 12px 11px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.6);
            vertical-align: top;
          }
          .doc-prose tbody tr:last-child td { border-bottom: none; }

          /* HR */
          .doc-prose hr {
            border: none;
            border-top: 1px solid rgba(255,255,255,0.07);
            margin: 44px 0;
          }

          /* Strong / em */
          .doc-prose strong { font-weight: 600; color: rgba(255,255,255,0.85); }
          .doc-prose em { color: rgba(255,255,255,0.55); }
        `}</style>

        <MDXRemote
          source={doc!.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            },
          }}
        />
      </div>

      {/* Prev / Next navigation */}
      {(prevDoc || nextDoc) && (
        <div
          style={{
            marginTop: "80px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {prevDoc ? (
            <Link
              href={`/docs/${prevDoc.slug}`}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "18px 22px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                flex: 1,
                maxWidth: "48%",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "var(--font-poppins), sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                ← Previous
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "var(--font-poppins), sans-serif",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                }}
              >
                {prevDoc.title}
              </span>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {nextDoc ? (
            <Link
              href={`/docs/${nextDoc.slug}`}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "18px 22px",
                borderRadius: "12px",
                border: "1px solid rgba(251,191,36,0.16)",
                background: "rgba(251,191,36,0.04)",
                flex: 1,
                maxWidth: "48%",
                textAlign: "right",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "rgba(251,191,36,0.45)",
                  fontFamily: "var(--font-poppins), sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                Next →
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fbbf24",
                  fontFamily: "var(--font-poppins), sans-serif",
                  lineHeight: 1.35,
                  letterSpacing: "-0.01em",
                }}
              >
                {nextDoc.title}
              </span>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}
        </div>
      )}
    </article>
  );
}