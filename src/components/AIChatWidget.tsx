/* eslint-disable i18next/no-literal-string -- internal admin/dev-facing labels in chat widget tabs */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Headset } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load react-markdown (~110KB) — only fetched when first message renders.
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

import { proxyUrl, apiUrl } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";


// Phone captured once per browser session so we don't re-ask on every open.
const CHAT_PHONE_KEY = "binayah_chat_phone";

// Chrome for the phone gate + human-handoff, localized inline (the AI itself
// answers in the user's language; this keeps the wrapper UI localized too
// without threading new keys through all 7 message files).
type Chrome = {
  gateTitle: string; gateSubtitle: string; phonePlaceholder: string;
  startChat: string; invalidPhone: string; talkToPerson: string;
  connectingAgent: string; agentRequested: string;
};
const CHROME: Record<string, Chrome> = {
  en: { gateTitle: "Before we begin", gateSubtitle: "Leave your phone number so our team can follow up in case the chat drops.", phonePlaceholder: "Your phone number", startChat: "Start chat", invalidPhone: "Please enter a valid phone number", talkToPerson: "Talk to a person", connectingAgent: "Connecting you to a Binayah agent — I'll keep helping here while you wait.", agentRequested: "Agent requested" },
  ru: { gateTitle: "Прежде чем начать", gateSubtitle: "Оставьте номер телефона, чтобы наша команда связалась с вами, если чат прервётся.", phonePlaceholder: "Ваш номер телефона", startChat: "Начать чат", invalidPhone: "Введите корректный номер телефона", talkToPerson: "Связаться с человеком", connectingAgent: "Подключаю вас к агенту Binayah — я продолжу помогать, пока вы ждёте.", agentRequested: "Запрошен агент" },
  ar: { gateTitle: "قبل أن نبدأ", gateSubtitle: "اترك رقم هاتفك ليتواصل فريقنا معك في حال انقطعت المحادثة.", phonePlaceholder: "رقم هاتفك", startChat: "ابدأ المحادثة", invalidPhone: "يرجى إدخال رقم هاتف صحيح", talkToPerson: "التحدث مع شخص", connectingAgent: "نصلك بأحد وكلاء Binayah — سأستمر في مساعدتك هنا أثناء الانتظار.", agentRequested: "تم طلب وكيل" },
  zh: { gateTitle: "开始之前", gateSubtitle: "请留下您的电话号码，以便在聊天中断时我们的团队能与您联系。", phonePlaceholder: "您的电话号码", startChat: "开始聊天", invalidPhone: "请输入有效的电话号码", talkToPerson: "联系真人", connectingAgent: "正在为您接通 Binayah 顾问，等待期间我会继续为您提供帮助。", agentRequested: "已请求顾问" },
  vi: { gateTitle: "Trước khi bắt đầu", gateSubtitle: "Để lại số điện thoại để đội ngũ của chúng tôi liên hệ nếu cuộc trò chuyện bị gián đoạn.", phonePlaceholder: "Số điện thoại của bạn", startChat: "Bắt đầu trò chuyện", invalidPhone: "Vui lòng nhập số điện thoại hợp lệ", talkToPerson: "Nói chuyện với người thật", connectingAgent: "Đang kết nối bạn với nhân viên Binayah — tôi vẫn ở đây hỗ trợ trong khi bạn chờ.", agentRequested: "Đã yêu cầu nhân viên" },
  he: { gateTitle: "לפני שנתחיל", gateSubtitle: "השאירו מספר טלפון כדי שהצוות שלנו יחזור אליכם אם הצ'אט יתנתק.", phonePlaceholder: "מספר הטלפון שלך", startChat: "התחלת צ'אט", invalidPhone: "אנא הזינו מספר טלפון תקין", talkToPerson: "לדבר עם נציג", connectingAgent: "מחבר אתכם לנציג Binayah — אמשיך לעזור כאן בזמן ההמתנה.", agentRequested: "נציג התבקש" },
  fr: { gateTitle: "Avant de commencer", gateSubtitle: "Laissez votre numéro de téléphone pour que notre équipe puisse vous recontacter si le chat se coupe.", phonePlaceholder: "Votre numéro de téléphone", startChat: "Démarrer le chat", invalidPhone: "Veuillez saisir un numéro de téléphone valide", talkToPerson: "Parler à une personne", connectingAgent: "Connexion à un agent Binayah — je continue de vous aider ici en attendant.", agentRequested: "Agent demandé" },
};

type Msg = { role: "user" | "assistant" | "system"; content: string };

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

  // Robust SSE parse: split on newlines, process every COMPLETE line, and keep
  // the final (possibly partial) line in `buffer` for the next read. The old
  // parser rebuffered on JSON errors and could drop a delta mid-stream — that
  // was the cause of the dropped/merged characters (e.g. "рый день", missing
  // spaces) in non-latin replies where tokens split across chunk boundaries.
  const handleLine = (raw: string) => {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (!line.startsWith("data: ")) return;
    const jsonStr = line.slice(6);
    if (jsonStr === "[DONE]") { done = true; return; }
    try {
      const content = JSON.parse(jsonStr)?.choices?.[0]?.delta?.content;
      if (content) onDelta(content);
    } catch {
      /* a genuinely malformed complete line — skip it, never rebuffer */
    }
  };

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // last item may be an incomplete line
    for (const line of lines) {
      handleLine(line);
      if (done) break;
    }
  }
  // Flush any trailing complete line left in the buffer at stream end.
  if (!done && buffer) handleLine(buffer);
  onDone();
}

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
  const locale = useLocale();
  const L = CHROME[locale] ?? CHROME.en;
  const [open, setOpen] = useState(false);
  const [phoneReady, setPhoneReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState(false);
  const [submittingPhone, setSubmittingPhone] = useState(false);
  const [humanRequested, setHumanRequested] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<((text?: string) => Promise<void>) | null>(null);
  const pendingQuestionRef = useRef<string | null>(null);

  // Phone is captured once per browser session.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(CHAT_PHONE_KEY)) setPhoneReady(true);
  }, []);

  // Summon a real agent: open LiveChat (its own window) but DON'T hide the AI —
  // the visitor keeps chatting with the AI here while an agent connects.
  useEffect(() => {
    if (!humanRequested || typeof document === "undefined") return;
    document.body.classList.add("livechat-visible");
    const apply = () => {
      const lc = getLiveChat();
      if (!lc?.call) return false;
      lc.call("maximize");
      return true;
    };
    if (apply()) return;
    const interval = setInterval(() => { if (apply()) clearInterval(interval); }, 400);
    const timeout = setTimeout(() => clearInterval(interval), 12_000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [humanRequested]);

  // Safety net: drop the body class if the widget unmounts mid-chat.
  useEffect(() => () => {
    if (typeof document !== "undefined") document.body.classList.remove("livechat-visible");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Keep sendRef pointing at the latest send closure so external triggers work.
  useEffect(() => { sendRef.current = send; });

  // External triggers (hero, sticky CTA, property/project, navbar mobile).
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setOpen(true);
      const q = e.detail?.question;
      if (!q) return;
      if (typeof window !== "undefined" && sessionStorage.getItem(CHAT_PHONE_KEY)) {
        setTimeout(() => sendRef.current?.(q), 100);
      } else {
        pendingQuestionRef.current = q; // send once the phone gate is passed
      }
    };
    window.addEventListener("open-ai-chat" as never, handler as EventListener);
    return () => window.removeEventListener("open-ai-chat" as never, handler as EventListener);
  }, []);

  function requestHuman() {
    if (humanRequested) { getLiveChat()?.call?.("maximize"); return; }
    setHumanRequested(true);
    setMessages((prev) => [...prev, { role: "system", content: L.connectingAgent }]);
  }

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    const raw = phone.trim();
    if (!/^\+?[\d\s\-().]{7,}$/.test(raw)) { setPhoneErr(true); return; }
    setPhoneErr(false);
    setSubmittingPhone(true);
    // Best-effort lead capture — save as an inquiry (fires the team WhatsApp
    // alert + shows in /admin/leads). Never block the chat on this.
    try {
      await fetch(apiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "AI Chat visitor", phone: raw, inquiryType: "ai-chat", source: "ai-chat",
          message: `Started the AI chat on ${typeof window !== "undefined" ? window.location.pathname : ""}`,
          hp: "",
        }),
      });
    } catch { /* non-blocking */ }
    if (typeof window !== "undefined") sessionStorage.setItem(CHAT_PHONE_KEY, raw);
    setSubmittingPhone(false);
    setPhoneReady(true);
    const q = pendingQuestionRef.current;
    pendingQuestionRef.current = null;
    if (q) setTimeout(() => sendRef.current?.(q), 100);
  }

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
        // AI decided to bring in a human — open LiveChat but keep the AI here.
        onHandoff: () => setTimeout(() => requestHuman(), 1200),
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("errorGeneric") }]);
      setIsLoading(false);
    }
  };

  const showTalk = phoneReady && !humanRequested && messages.some((m) => m.role === "assistant");

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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/15 border border-white/25">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm tracking-wide truncate">{t("title")}</p>
                  {humanRequested ? (
                    <p className="text-white/70 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {L.agentRequested}
                    </p>
                  ) : (
                    <p className="text-white/70 text-xs flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {t("subtitle")}
                    </p>
                  )}
                </div>
                {showTalk && (
                  <button
                    type="button"
                    onClick={requestHuman}
                    className="flex items-center gap-1.5 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex-shrink-0"
                    aria-label={L.talkToPerson}
                  >
                    <Headset className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{L.talkToPerson}</span>
                  </button>
                )}
              </div>
            </div>

            {!phoneReady ? (
              /* ── Phone gate — required before the chat starts ── */
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>
                  <MessageCircle className="h-7 w-7" style={{ color: "#1A7A5A" }} />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{L.gateTitle}</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-[280px]">{L.gateSubtitle}</p>
                <form onSubmit={submitPhone} className="w-full max-w-[300px]">
                  <input
                    type="tel"
                    inputMode="tel"
                    autoFocus
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (phoneErr) setPhoneErr(false); }}
                    placeholder={L.phonePlaceholder}
                    className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: phoneErr ? "#dc2626" : "#e5e7eb", "--tw-ring-color": "rgba(11,61,46,0.2)" } as React.CSSProperties}
                  />
                  {phoneErr && <p className="text-[11px] text-red-600 mt-1.5 text-left">{L.invalidPhone}</p>}
                  <button
                    type="submit"
                    disabled={submittingPhone || !phone.trim()}
                    className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                  >
                    {submittingPhone ? "…" : L.startChat}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* AI Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
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

                {/* Input */}
                <div className="border-t border-border p-3">
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
