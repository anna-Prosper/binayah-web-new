import { redirect } from "next/navigation";

// /rent is preserved for SEO and direct/external traffic. The unified
// filter UX lives on /search?intent=rent — sending visitors straight
// there means Buy, Rent and Off-Plan all share the same filter bar.
export const metadata = {
  title: "Properties for Rent in Dubai | Binayah Properties",
  description:
    "Browse apartments, villas and townhouses for rent in Dubai. Find your perfect rental with Binayah Properties.",
};

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ intent: "rent" });
  for (const [k, v] of Object.entries(sp)) {
    if (k === "intent") continue;
    if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
    else if (v != null) qs.set(k, v);
  }
  redirect(`/search?${qs.toString()}`);
}
