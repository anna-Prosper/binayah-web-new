"use client";

import { useState, type ReactNode } from "react";
import { Globe, X } from "lucide-react";

/**
 * One selectable facet. `token` is the CSS-safe slug that appears in a card's
 * space-separated `data-agent-langs` attribute; `label` is what the user reads
 * (a real language name straight from the agent data, or the translated
 * "language not listed" label for the no-languages bucket).
 */
export interface LanguageOption {
  token: string;
  label: string;
  count: number;
}

export interface FilterLabels {
  /** "Filter by language" */
  filter: string;
  /** "All languages" */
  all: string;
  /** "Clear" */
  clear: string;
  /** "Showing {shown} of {total} agents" */
  showing: string;
  /** shown when the active facet matches nothing */
  noMatch: string;
}

interface Props {
  options: LanguageOption[];
  /** number of agent cards rendered inside `children` */
  total: number;
  labels: FilterLabels;
  /** the server-rendered agent grid — passed through untouched */
  children: ReactNode;
}

/**
 * Client-side language facet over an already-server-rendered agent grid.
 *
 * SEO contract: this component never renders the agent cards itself. The full
 * grid arrives as `children` from the server component and is emitted verbatim
 * into the HTML, so every profile link and every Person schema stays in the
 * served markup no matter what the filter is set to. Filtering is done purely
 * with a scoped `display: none` stylesheet keyed off each card's
 * `data-agent-langs` attribute — nothing is unmounted, nothing is refetched,
 * and no URL state is written (no crawlable filtered variants).
 *
 * No-JS contract: initial state is "no facet selected", which emits no
 * stylesheet at all, so the untouched full grid renders. The chips are inert
 * without hydration but hide nobody.
 */
export default function TeamDirectoryClient({ options, total, labels, children }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const activeOption = active ? (options.find((o) => o.token === active) ?? null) : null;
  const shown = activeOption ? activeOption.count : total;

  // Nothing to facet on (no agent has a language recorded) — render the grid
  // untouched rather than a control with a single dead "all" chip.
  if (options.length === 0) return <>{children}</>;

  // Belt-and-braces: the token is already a slug, but it is interpolated into a
  // stylesheet, so re-sanitise to the CSS-identifier charset before use.
  const safeToken = (activeOption?.token ?? "").replace(/[^a-z0-9_-]/g, "");
  const css = safeToken
    ? `#team-agent-grid [data-agent-langs]:not([data-agent-langs~="${safeToken}"]){display:none!important}`
    : "";

  const chipBase =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";
  const chipOn = "border-primary bg-primary/10 text-foreground";
  const chipOff = "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground";

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-foreground">
            <Globe className="h-3.5 w-3.5 text-primary/70" />
            {labels.filter}
          </span>
          <span className="text-xs text-muted-foreground">
            {labels.showing.replace("{shown}", String(shown)).replace("{total}", String(total))}
          </span>
          {activeOption && (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <X className="h-3 w-3" />
              {labels.clear}
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={labels.filter}>
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-pressed={activeOption === null}
            className={`${chipBase} ${activeOption === null ? chipOn : chipOff}`}
          >
            <span>{labels.all}</span>
            <span className="rounded-full bg-foreground/8 px-1.5 py-px text-[10px] tabular-nums text-muted-foreground">
              {total}
            </span>
          </button>
          {options.map((o) => {
            const on = o.token === active;
            return (
              <button
                key={o.token}
                type="button"
                onClick={() => setActive(on ? null : o.token)}
                aria-pressed={on}
                className={`${chipBase} ${on ? chipOn : chipOff}`}
              >
                <span>{o.label}</span>
                <span className="rounded-full bg-foreground/8 px-1.5 py-px text-[10px] tabular-nums text-muted-foreground">
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}

      <div id="team-agent-grid">{children}</div>

      {activeOption && shown === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">{labels.noMatch}</p>
      )}
    </div>
  );
}
