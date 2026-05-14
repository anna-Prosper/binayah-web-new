"use client";

import { useState } from "react";

interface SubscriberItem {
  email: string;
  date: string;
  dupeCount: number;
}

interface ProjectGroup {
  slug: string;
  name: string;
  subscribers: SubscriberItem[];
}

export default function SubscriptionsMobileList({ projects }: { projects: ProjectGroup[] }) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => {
        const isExpanded = expandedSlug === project.slug;
        return (
          <div key={project.slug} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              className="w-full text-left px-4 py-4 flex items-center justify-between gap-3 focus:outline-none"
              onClick={() => setExpandedSlug(isExpanded ? null : project.slug)}
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{project.name}</div>
                {project.name !== project.slug && (
                  <div className="text-xs text-gray-400 mt-0.5">/{project.slug}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {project.subscribers.length}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100">
                {project.subscribers.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-50 last:border-b-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <a href={`mailto:${item.email}`} className="text-emerald-700 text-sm hover:underline truncate">
                        {item.email || <span className="text-gray-300 italic">anonymous</span>}
                      </a>
                      {item.dupeCount > 1 && (
                        <span className="text-[10px] font-medium text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                          ×{item.dupeCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
