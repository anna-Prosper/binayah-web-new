import NewsPageClient from "./NewsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export default async function NewsPage() {
  let articles: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl("/api/news"));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
