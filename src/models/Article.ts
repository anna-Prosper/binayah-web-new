import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  wpId: number;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  viewCount: number;
  publishedAt: string;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    content: String,
    excerpt: String,
    category: { type: String, default: "Uncategorized", index: true },
    tags: { type: [String], default: [] },
    featuredImage: String,
    author: { type: String, default: "Binayah Editorial" },
    readTime: String,
    metaTitle: String,
    metaDescription: String,
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: String, index: true },
    publishStatus: { type: String, default: "Published" },
  },
  { timestamps: true }
);

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
