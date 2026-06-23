/* eslint-disable i18next/no-literal-string -- internal admin/dev-facing labels in chat widget tabs */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Lazy-load react-markdown (~110KB) — only fetched when first message renders.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

import { proxyUrl } from "@/lib/api";
import { useTranslations } from "next-intl";

const binayahLogo = "/assets/binayah-logo.webp";

type Msg = { role: "user" | "assistant" | "system"; content: string };

// Idle timer + warning banner live in <LiveChatBanner /> mounted at the
// root layout — it works on every page, not just where AIChatWidget is.

const CHAT_URL = proxyUrl("/api/chat");

function getSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const key = "binayah_chat_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem(key, sid); }
  return sid;
}

async function streamChat({
  messages,
  sessionId,
  page,
  onDelta,
  onDone,
  onError,
  onHandoff,
  fallbacks,
}: {
  messages: Msg[];
  sessionId: string;
  page: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
  onHandoff?: () => void;
  fallbacks: { busy: string; generic: string };
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, sessionId, page }),
  });

  if (resp.status === 429 || resp.status === 402) {
    const data = await resp.json();
    onError(data.error || fallbacks.busy);
    return;
  }
  if (!resp.ok || !resp.body) {
    let errMsg = fallbacks.generic;
    try { const d = await resp.json(); if (d?.error) errMsg = d.error; } catch { /* ignore */ }
    console.warn("[chat]", resp.status, errMsg);
    onError(errMsg);
    return;
  }

  // Human-handoff: backend returns plain JSON (not SSE stream) with
  // { handoff: true, choices: [{ message: { content } }] }. Parse it once,
  // surface the message, and fire onHandoff so the UI can open LiveChat.
  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) onDelta(content);
      if (data?.handoff) onHandoff?.();
      onDone();
      return;
    } catch {
      onError(fallbacks.generic);
      return;
    }
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

type ChatMode = "ai" | "human";

type LiveChatApi = {
  call: (cmd: string, arg?: unknown) => void;
  on?: (event: string, handler: (payload?: unknown) => void) => void;
  off?: (event: string, handler: (payload?: unknown) => void) => void;
};

function getLiveChat(): LiveChatApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { LiveChatWidget?: LiveChatApi }).LiveChatWidget;
}

const AIChatWidget = () => {
  const t = useTranslations("aiChat");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("ai");
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Append a system divider message and flip back to AI mode.
  const endHumanChat = (reason: "manual" | "timeout") => {
    const text = reason === "timeout"
      ? t("liveChatEndedInactivity")
      : t("liveChatEnded");
    setMessages((prev) => [...prev, { role: "system", content: text }]);
    setMode("ai");
    setEndConfirmOpen(false);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<((text?: string) => Promise<void>) | null>(null);

  // Drive LiveChat's standard widget based on our mode. CSS (globals.css)
  // hides LiveChat's container by default; we toggle body.livechat-visible
  // to show it in human mode AND call its SDK to maximize the chat panel.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("livechat-visible", mode === "human");

    const apply = () => {
      const lc = getLiveChat();
      if (!lc?.call) return false;
      if (mode === "human") {
        lc.call("maximize");
      } else {
        lc.call("hide");
      }
      return true;
    };
    if (apply()) return;
    // LiveChat loads async via lazyOnload — retry until the API attaches.
    const interval = setInterval(() => {
      if (apply()) clearInterval(interval);
    }, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10_000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mode]);

  // Safety net: ensure body class is removed if the widget unmounts mid-chat.
  useEffect(() => () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("livechat-visible");
    }
  }, []);

  // Inactivity timer + auto-end live in LiveChatBanner (mounted in root
  // layout). When that timer fires it hides LiveChat directly, which our
  // mode-driven effect picks up via SDK visibility events the next time
  // this widget mounts. The divider message append still happens here
  // only when AIChatWidget is open AND end is triggered from inside it.

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Keep sendRef pointing to the latest send closure so external triggers work
  useEffect(() => { sendRef.current = send; });

  // Listen for external trigger (e.g., hero search "Ask AI")
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setOpen(true);
      if (e.detail?.question) {
        // Use ref-based call so we always get the current send function
        setTimeout(() => sendRef.current?.(e.detail.question), 100);
      }
    };
    window.addEventListener("open-ai-chat" as any, handler);
    return () => window.removeEventListener("open-ai-chat" as any, handler);
  }, []);

  const send = async (directText?: string) => {
    const text = (directText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        sessionId: getSessionId(),
        page: typeof window !== "undefined" ? window.location.pathname : "",
        fallbacks: { busy: t("errorBusy"), generic: t("errorGeneric") },
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: msg || t("errorGeneric") }]);
          setIsLoading(false);
        },
        onHandoff: () => {
          // Switch the AI bubble to Live Agent mode after the user reads the
          // handoff message. Insert a system divider so the AI conversation
          // shows when the live session started AND its 30-min auto-end rule.
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "system", content: t("liveChatStarted") },
            ]);
            setMode("human");
          }, 1500);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("errorGeneric") }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        data-chat-trigger
        onClick={() => setOpen(!open)}
        className="hidden sm:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full items-center justify-center shadow-lg transition-all hover:scale-110" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 8px 24px rgba(11,61,46,0.4)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        aria-label={t("open")}
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[400px] max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] bg-card rounded-2xl flex flex-col overflow-hidden"
            style={{ height: "min(520px, calc(100vh - 140px))", boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(11,61,46,0.12)" }}
          >
            {/* Header */}
            <div className="px-5 py-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, transparent)" }} />
              {mode === "ai" ? (
                <div className="flex items-center gap-3">
                  <Image src={binayahLogo} alt="Binayah" height={28} width={85} className="h-7 w-auto brightness-0 invert" />
                  <div>
                    <p className="text-white font-bold text-sm tracking-wide">{t("title")}</p>
                    <p className="text-white/60 text-xs">{t("subtitle")}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEndConfirmOpen(true)}
                    className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={t("backToAI")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    {t("backToAI")}
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-white font-bold text-sm tracking-wide flex items-center justify-end gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t("liveAgent")}
                    </p>
                    <p className="text-white/60 text-[11px]">{t("connectedViaLiveChat")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Agent — LiveChat opens via its own SDK; this panel acts as
                the "back" control and status display. The actual chat surface
                is rendered by LiveChat's widget (maximized when mode === "human"). */}
            {mode === "human" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center bg-secondary/30">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{t("chatWithLiveAgent")}</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-[260px]">
                  {t("liveAgentPanelDesc")}
                </p>
                <button
                  type="button"
                  onClick={() => getLiveChat()?.call?.("maximize")}
                  className="text-xs font-semibold px-4 py-2 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                >
                  {t("openLiveChat")}
                </button>
              </div>
            )}

            {/* AI Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ display: mode === "ai" ? undefined : "none" }}
            >
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}><Bot className="h-7 w-7" style={{ color: "#1A7A5A" }} /></div>
                  <p className="text-sm font-semibold text-foreground mb-1">{t("greeting")}</p>
                  <p className="text-xs text-muted-foreground">{t("placeholder")}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {[t("suggestions.bestAreas"), t("suggestions.offPlanROI"), t("suggestions.goldenVisa")].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-xs px-4 py-2 rounded-full border transition-all hover:scale-105 font-medium" style={{ borderColor: "rgba(11,61,46,0.2)", color: "#0B3D2E", background: "rgba(11,61,46,0.05)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => {
                if (m.role === "system") {
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 my-1">
                      <span className="flex-1 h-px bg-border" />
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                        {m.content}
                      </span>
                      <span className="flex-1 h-px bg-border" />
                    </div>
                  );
                }
                return (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.15), rgba(26,122,90,0.2))", border: "1px solid rgba(11,61,46,0.2)" }}>
                      <Bot className="h-3.5 w-3.5" style={{ color: "#1A7A5A" }} />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md text-white"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                    style={
                      m.role === "user"
                        ? { background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }
                        : undefined
                    }
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1 prose-headings:text-sm">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-accent" />
                    </div>
                  )}
                </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.15), rgba(26,122,90,0.2))", border: "1px solid rgba(11,61,46,0.2)" }}>
                    <Bot className="h-3.5 w-3.5" style={{ color: "#1A7A5A" }} />
                  </div>
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input — AI mode only; LiveChat iframe has its own input */}
            <div className="border-t border-border p-3" style={{ display: mode === "ai" ? undefined : "none" }}>
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all" style={{ "--tw-ring-color": "rgba(11,61,46,0.2)" } as React.CSSProperties}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 disabled:opacity-50 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                >
                  <Send className="h-4 w-4 text-primary-foreground" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top banner + idle timer are now owned by the standalone
          LiveChatBanner component mounted in [locale]/layout.tsx so it
          works on every page, not just where AIChatWidget is mounted. */}

      {/* End-live-chat confirmation modal */}
      {endConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4"
          onClick={() => setEndConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">End live chat?</h3>
            <p className="text-sm text-gray-600 mb-5">
              You&apos;re currently chatting with a live agent. Going back to the AI assistant will end the live session.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEndConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Stay in chat
              </button>
              <button
                type="button"
                onClick={() => endHumanChat("manual")}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                End & return to AI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;