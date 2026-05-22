import { redirect } from "next/navigation";

// /off-plan is preserved as a public URL for SEO and external links. The
// unified filter UX lives on /search?status=Off-Plan; sending visitors
// straight there means Off-Plan, Buy and Rent all share the same filter
// bar instead of three divergent layouts.
export const metadata = {
  title: "Off-Plan Properties in Dubai | Binayah Properties",
  description:
    "Discover Dubai's best off-plan developments. High-ROI projects in prime locations with flexible payment plans. Browse with Binayah Properties.",
};

export default async function OffPlanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ status: "Off-Plan" });
  for (const [k, v] of Object.entries(sp)) {
    if (k === "status") continue;
    if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
    else if (v != null) qs.set(k, v);
  }
  redirect(`/search?${qs.toString()}`);
}
