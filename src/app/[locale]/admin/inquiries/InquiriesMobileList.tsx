"use client";

import { useState } from "react";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  type: string;
  message: string;
  date: string;
}

interface Props {
  inquiries: InquiryItem[];
}

export default function InquiriesMobileList({ inquiries }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-400 text-sm">
        No inquiries yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {inquiries.map((row) => {
        const isExpanded = expandedId === row.id;
        return (
          <div
            key={row.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Card header — always visible */}
            <button
              className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 focus:outline-none"
              onClick={() => setExpandedId(isExpanded ? null : row.id)}
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">
                    {row.name || <span className="text-gray-300">Unknown</span>}
                  </span>
                  {row.source && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {row.source}
                    </span>
                  )}
                  {row.type && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {row.type}
                    </span>
                  )}
                </div>

                {/* Contact info stacked */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {row.email && (
                    <a
                      href={`mailto:${row.email}`}
                      className="text-emerald-700 text-xs hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.email}
                    </a>
                  )}
                  {row.phone && (
                    <a
                      href={`tel:${row.phone.replace(/\s/g, "")}`}
                      className="text-gray-600 text-xs hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.phone}
                    </a>
                  )}
                </div>

                {/* Message preview when collapsed */}
                {!isExpanded && row.message && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 break-words">
                    {row.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">{row.date}</span>
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

            {/* Expanded full message */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Message</p>
                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                  {row.message || <span className="text-gray-300">No message</span>}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
