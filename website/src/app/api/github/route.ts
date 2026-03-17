import { NextResponse } from "next/server";

const REPO = "osndot/osn";
const GITHUB_API = "https://api.github.com";

export type GitHubCommit = {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  url: string;
  author: { name: string; login: string; avatarUrl: string };
};

export type GitHubContributor = {
  login: string;
  avatarUrl: string;
  url: string;
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const [commitsRes, contributorsRes] = await Promise.all([
      fetch(`${GITHUB_API}/repos/${REPO}/commits?per_page=1`, {
        headers,
        next: { revalidate: 120 },
      }),
      fetch(`${GITHUB_API}/repos/${REPO}/contributors?per_page=10`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    if (!commitsRes.ok) {
      return NextResponse.json(
        { error: "Commits fetch failed", lastCommit: null, contributors: [] },
        { status: 200 }
      );
    }

    const [commitsData, contributorsData] = await Promise.all([
      commitsRes.json(),
      contributorsRes.ok ? contributorsRes.json() : [],
    ]);

    const lastCommit: GitHubCommit | null =
      Array.isArray(commitsData) && commitsData[0]
        ? {
            sha: commitsData[0].sha,
            shortSha: commitsData[0].sha.slice(0, 7),
            message: commitsData[0].commit.message.split("\n")[0],
            date: commitsData[0].commit.author?.date ?? "",
            url: commitsData[0].html_url,
            author: {
              name: commitsData[0].commit.author?.name ?? "",
              login: commitsData[0].author?.login ?? "",
              avatarUrl: commitsData[0].author?.avatar_url ?? "",
            },
          }
        : null;

    const contributors: GitHubContributor[] = Array.isArray(contributorsData)
      ? contributorsData.map((c: { login: string; avatar_url: string; html_url: string }) => ({
          login: c.login,
          avatarUrl: c.avatar_url,
          url: c.html_url,
        }))
      : [];

    return NextResponse.json({ lastCommit, contributors });
  } catch (e) {
    console.error("GitHub API error:", e);
    return NextResponse.json(
      { error: "Server error", lastCommit: null, contributors: [] },
      { status: 200 }
    );
  }
}
