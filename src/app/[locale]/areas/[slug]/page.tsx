import { redirect } from "next/navigation";

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const lp = locale === "en" ? "" : `/${locale}`;
  redirect(`${lp}/communities/${slug}`);
}
