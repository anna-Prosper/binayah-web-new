import NewsPageClient from "@/app/_clients/news/NewsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 900;

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  let articles: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/news?lang=${locale}`));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
