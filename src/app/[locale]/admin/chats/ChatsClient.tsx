"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, User, Bot, ChevronRight, X, AlertCircle, Phone } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

interface ChatSession {
  _id: string;
  sessionId: string;
  messages: ChatMessage[];
  page?: string;
  hasLead: boolean;
  handoff: boolean;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  createdAt: string;
  updatedAt: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function fetchSessions(page: number, filter: string) {
  const params = new URLSearchParams({ path: "/api/admin/chat-sessions", page: String(page), limit: "40" });
  if (filter === "lead") params.set("hasLead", "true");
  if (filter === "handoff") params.set("handoff", "true");
  const res = await fetch(`/api/admin/proxy?${params}`);
  if (!res.ok) throw new Error("Failed to load");
  return res.json() as Promise<{ sessions: ChatSession[]; total: number }>;
}

async function fetchSession(sessionId: string): Promise<ChatSession> {
  const params = new URLSearchParams({ path: `/api/admin/chat-sessions/${sessionId}` });
  const res = await fetch(`/api/admin/proxy?${params}`);
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

export default function ChatsClient() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["chat-sessions", page, filter],
    queryFn: () => fetchSessions(page, filter),
  });

  const { data: transcript, isLoading: transcriptLoading } = useQuery({
    queryKey: ["chat-session", selected],
    queryFn: () => fetchSession(selected!),
    enabled: !!selected,
  });

  const totalPages = data ? Math.ceil(data.total / 40) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
      {/* List */}
      <div className="flex-1 min-w-0">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { value: "all", label: "All" },
            { value: "lead", label: "Has Lead" },
            { value: "handoff", label: "Handoff" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{data?.total ?? "-"} sessions</span>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : !data?.sessions.length ? (
          <div className="text-center py-16 text-gray-400">No chat sessions yet.</div>
        ) : (
          <div className="space-y-2">
            {data.sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => setSelected(s.sessionId)}
                className={`w-full text-left bg-white rounded-xl border px-4 py-3 flex items-center gap-3 hover:border-primary/40 transition-colors ${
                  selected === s.sessionId ? "border-primary/60 ring-1 ring-primary/20" : "border-gray-200"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {s.leadName || "Anonymous"}
                    </span>
                    {s.hasLead && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Lead</span>
                    )}
                    {s.handoff && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">Handoff</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 truncate">{s.page || "/"}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{fmt(s.updatedAt)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >← Prev</button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >Next →</button>
          </div>
        )}
      </div>

      {/* Transcript panel */}
      {selected && (
        <div className="w-[420px] flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-120px)] sticky top-6 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">
                {transcript?.leadName || "Anonymous"}
              </p>
              {(transcript?.leadEmail || transcript?.leadPhone) && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {transcript?.leadPhone || transcript?.leadEmail}
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {transcriptLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
            ) : !transcript?.messages?.length ? (
              <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                No messages recorded for this session.
              </div>
            ) : (
              transcript.messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`text-[10px] mt-1 ${m.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(m.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })}
                    </p>
                  </div>
                  {m.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {transcript && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex gap-3">
              <span>Started {fmt(transcript.createdAt)}</span>
              <span>·</span>
              <span>{transcript.page || "/"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
