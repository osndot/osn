import { NextResponse } from "next/server";

const TWITTER_API = "https://api.twitter.com/2";

export type Tweet = {
  id: string;
  text: string;
  created_at: string;
  url: string;
};

export async function GET() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  const username = process.env.TWITTER_USERNAME || "spaceownn";

  if (!token) {
    return NextResponse.json(
      { error: "Twitter API not configured", tweets: [], username: username },
      { status: 200 }
    );
  }

  try {
    const userRes = await fetch(
      `${TWITTER_API}/users/by/username/${encodeURIComponent(username)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    );

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Twitter user lookup failed:", userRes.status, errText);
      if (userRes.status === 402) {
        try {
          const errJson = JSON.parse(errText);
          if (errJson.title === "CreditsDepleted" || errJson.detail?.includes("credits")) {
            return NextResponse.json(
              { error: "credits_depleted", tweets: [], username },
              { status: 200 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "credits_depleted", tweets: [], username },
            { status: 200 }
          );
        }
      }
      return NextResponse.json(
        { error: "User not found", tweets: [], username },
        { status: 200 }
      );
    }

    const userData = await userRes.json();
    const userId = userData.data?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User id missing", tweets: [], username },
        { status: 200 }
      );
    }

    const tweetsRes = await fetch(
      `${TWITTER_API}/users/${userId}/tweets?max_results=3&tweet.fields=created_at,text&exclude=replies,retweets`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    );

    if (!tweetsRes.ok) {
      const errText = await tweetsRes.text();
      console.error("Twitter tweets fetch failed:", tweetsRes.status, errText);
      if (tweetsRes.status === 402) {
        try {
          const errJson = JSON.parse(errText);
          if (errJson.title === "CreditsDepleted" || errJson.detail?.includes("credits")) {
            return NextResponse.json(
              { error: "credits_depleted", tweets: [], username },
              { status: 200 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "credits_depleted", tweets: [], username },
            { status: 200 }
          );
        }
      }
      return NextResponse.json(
        { error: "Tweets fetch failed", tweets: [], username },
        { status: 200 }
      );
    }

    const tweetsData = await tweetsRes.json();
    const tweets: Tweet[] = (tweetsData.data || []).map((t: { id: string; text: string; created_at: string }) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      url: `https://twitter.com/${username}/status/${t.id}`,
    }));

    return NextResponse.json({ tweets, username });
  } catch (e) {
    console.error("Tweets API error:", e);
    return NextResponse.json(
      { error: "Server error", tweets: [], username },
      { status: 200 }
    );
  }
}
