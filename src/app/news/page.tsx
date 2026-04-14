import NewsPageClient from "./NewsPageClient";
import { serverApiUrl } from "@/lib/api";

export const revalidate = 300;

export default async function NewsPage() {
  let articles: any[] = [];
  try {
    const res = await fetch(serverApiUrl("/api/news"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
