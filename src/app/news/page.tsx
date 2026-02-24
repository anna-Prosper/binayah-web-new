import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import NewsPageClient from "./NewsPageClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  await connectDB();
  const articles = await Article.find({
    publishStatus: "Published",
    $or: [
      { content: { $regex: /\S/ } },
      { excerpt: { $regex: /\S/ } },
    ],
  })
    .select("title slug excerpt category featuredImage publishedAt readTime")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return <NewsPageClient articles={JSON.parse(JSON.stringify(articles))} />;
}
