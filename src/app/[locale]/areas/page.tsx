import { redirect } from "next/navigation";

/**
 * /areas is a permanent redirect to /communities.
 *
 * It rendered the same CommunitiesPageClient over the same 73 cards — 1,637
 * words against /communities' 1,620, differing only in the H1 ("Premier Areas"
 * vs "Premier Communities") and the metadata. It was also orphaned: absent from
 * the sitemap and unlinked from nav and footer, so it accrued nothing while
 * splitting topical signals with the page it duplicates.
 *
 * Its children already redirected here — /areas/[slug] has forwarded to
 * /communities/[slug] all along — so the index was the last piece of the
 * section still serving a duplicate. Redirecting consolidates any equity the
 * duplicate held rather than stranding it behind a noindex.
 */
export default async function AreasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lp = locale === "en" ? "" : `/${locale}`;
  redirect(`${lp}/communities`);
}
