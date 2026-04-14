import NewsPageClient from "./NewsPageClient";
import { serverApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  let articles: any[] = [];
  try {
    const res = await fetch(serverApiUrl("/api/news"));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
