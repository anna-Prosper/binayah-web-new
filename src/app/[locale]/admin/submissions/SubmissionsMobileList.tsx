"use client";

import { useState } from "react";

interface SubmissionItem {
  id: string;
  userEmail: string;
  phone: string;
  propertyType: string;
  community: string;
  askingPrice: string;
  description: string;
  date: string;
  statusLabel: string;
  statusClassName: string;
}

interface Props {
  submissions: SubmissionItem[];
}

export default function SubmissionsMobileList({ submissions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400 text-sm">
        No submissions yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {submissions.map((s) => {
        const isExpanded = expandedId === s.id;
        return (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Card header — always visible */}
            <button
              className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 focus:outline-none"
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {s.propertyType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {s.propertyType}
                    </span>
                  )}
                  {s.community && (
                    <span className="font-semibold text-gray-900 text-sm truncate">{s.community}</span>
                  )}
                </div>

                {/* Contact info stacked */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {s.userEmail && (
                    <a
                      href={`mailto:${s.userEmail}`}
                      className="text-emerald-700 text-xs hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {s.userEmail}
                    </a>
                  )}
                  {s.phone && (
                    <a
                      href={`tel:${s.phone.replace(/\s/g, "")}`}
                      className="text-gray-600 text-xs hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {s.phone}
                    </a>
                  )}
                </div>

                {/* Asking price */}
                {s.askingPrice && (
                  <div className="mt-1.5 text-sm font-semibold text-gray-900 tabular-nums">{s.askingPrice}</div>
                )}

                {/* Status badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.statusClassName}`}>
                    {s.statusLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">{s.date}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded description */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                  {s.description || <span className="text-gray-300">No description</span>}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
