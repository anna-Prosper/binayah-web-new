"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { apiUrl } from "@/lib/api";

const binayahLogo = "/assets/binayah-logo.png";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = apiUrl("/api/chat");

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (resp.status === 429 || resp.status === 402) {
    const data = await resp.json();
    onError(data.error || "Service busy, please try again.");
    return;
  }
  if (!resp.ok || !resp.body) {
    onError("Something went wrong. Please try again.");
    return;
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

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Listen for external trigger (e.g., hero search "Ask AI")
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setOpen(true);
      if (e.detail?.question) {
        setInput(e.detail.question);
        // Auto-send after opening
        setTimeout(() => {
          const btn = document.getElementById("chat-send-btn");
          if (btn) btn.click();
        }, 300);
      }
    };
    window.addEventListener("open-ai-chat" as any, handler);
    return () => window.removeEventListener("open-ai-chat" as any, handler);
  }, []);

  const send = async () => {
    const text = input.trim();
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
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
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
        aria-label="AI Chat Support"
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
            <div className="px-5 py-4 flex items-center gap-3 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A7A5A 100%)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, transparent)" }} />
              <img src={binayahLogo} alt="Binayah" className="h-7 w-auto brightness-0 invert" />
              <div>
                <p className="text-white font-bold text-sm tracking-wide">Binayah AI Assistant</p>
                <p className="text-white/60 text-xs">Ask about properties, areas &amp; more</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}><Bot className="h-7 w-7" style={{ color: "#1A7A5A" }} /></div>
                  <p className="text-sm font-semibold text-foreground mb-1">How can I help you today?</p>
                  <p className="text-xs text-muted-foreground">Ask about properties, prices, areas or investment advice.</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["Properties in Downtown", "Off-plan projects", "Investment advice"].map((q) => (
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
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.15), rgba(26,122,90,0.2))", border: "1px solid rgba(11,61,46,0.2)" }}>
                      <Bot className="h-3.5 w-3.5" style={{ color: "#1A7A5A" }} />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md text-white"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}>
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
              ))}
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
                  placeholder="Ask about properties..."
                  className="flex-1 bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all" style={{ "--tw-ring-color": "rgba(11,61,46,0.2)" } as React.CSSProperties}
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
    </>
  );
};

export default AIChatWidget;