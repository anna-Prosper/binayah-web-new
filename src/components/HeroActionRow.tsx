"use client";

import { DetailActions } from "@/components/PropertyActions";
import { SubscribeButton } from "@/components/SubscribeButton";

export interface HeroActionRowProps {
  slug: string;
  title: string;
  type?: "property" | "project";
  /** Render the Subscribe button alongside Save + Share. */
  subscribable?: boolean;
  projectImage?: string | null;
}

export function HeroActionRow({ slug, title, type = "property", subscribable = false, projectImage = null }: HeroActionRowProps) {
  return (
    // flex-wrap keeps long localized labels (RU/AR/ZH) usable on small screens
    // while still showing all actions in a single row when there's space.
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <DetailActions
        propertyId={slug}
        slug={slug}
        title={title}
        type={type}
        variant="hero"
      />
      {subscribable && (
        <SubscribeButton
          slug={slug}
          projectName={title}
          projectImage={projectImage}
          variant="hero"
        />
      )}
    </div>
  );
}
