"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Shield,
  Zap,
  AlertTriangle,
  Navigation,
  Users,
  Map,
  Trash2,
  RefreshCw,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/components/ThemeProvider";

const SYSTEM_MSGS = [
  {
    role: "user",
    content: `You are SHEild AI — an advanced women's personal safety assistant powered by Google Gemini AI.

Capabilities:
- Real-time emergency guidance (stalking, harassment, assault, medical)
- Step-by-step instructions for dangerous situations
- Safe route recommendations and travel safety
- Self-defense awareness and de-escalation techniques
- First aid and emergency response
- Guardian network setup guidance
- Evidence collection procedures
- Emergency services info (call 112 in India for police/ambulance/fire)
- Community safety intelligence

Language: Respond in the SAME language the user writes in. English and Hindi both supported.
Format: Use bullet points for steps. Be direct, calm, empowering.
Never be preachy. Prioritize safety above all.`,
  },
  {
    role: "assistant",
    content:
      "Understood. I'm SHEild AI — your personal safety copilot, ready 24/7. I provide expert guidance in English and Hindi. How can I help you stay safe today?",
  },
];

const QUICK_TOPICS = [
  {
    icon: AlertTriangle,
    label: "I'm being followed",
    prompt:
      "I think someone is following me right now. What should I do step by step?",
    color: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    text: "#f87171",
  },
  {
    icon: Navigation,
    label: "Safe route help",
    prompt: "How do I find the safest route to take tonight?",
    color: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.3)",
    text: "#60a5fa",
  },
  {
    icon: Shield,
    label: "I feel unsafe",
    prompt:
      "I'm in a situation where I feel very unsafe right now. What are the immediate steps I should take?",
    color: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    text: "#fbbf24",
  },
  {
    icon: Map,
    label: "Area safety check",
    prompt: "How can I check if an area is safe before going there at night?",
    color: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.3)",
    text: "#a78bfa",
  },
  {
    icon: Users,
    label: "Guardian setup",
    prompt:
      "How do I set up a guardian network using SHEild AI to keep me safe?",
    color: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    text: "#34d399",
  },
  {
    icon: Zap,
    label: "Emergency tips",
    prompt:
      "What are the most important emergency safety tips every woman should know?",
    color: "rgba(236,72,153,0.12)",
    border: "rgba(236,72,153,0.3)",
    text: "#f472b6",
  },
];

const INIT_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hello! I'm SHEild AI — your personal safety copilot, available 24/7.\n\nI can help with:\n• Emergency situations (stalking, harassment, medical)\n• Safe route recommendations\n• Guardian network setup\n• Self-defense awareness\n• First aid guidance\n• Nearby emergency services\n\nHow can I help you today? You can also write in Hindi — main Hindi mein bhi jawab de sakti hoon. 🛡",
  },
];

export default function AIAssistantPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (textOverride) => {
      const content = (textOverride || input).trim();
      if (!content || loading) return;

      const userMsg = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setLastPrompt(content);
      setInput("");
      setLoading(true);
      setError(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      try {
        // Build context: system messages + last 12 conversation messages + new message
        const contextMessages = [
          ...SYSTEM_MSGS,
          ...messages.filter((m) => m.role !== "system").slice(-12),
          userMsg,
        ];

        // Keep provider credentials and provider-specific URLs on the server.
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: contextMessages, stream: false }),
        });

        if (!res.ok) {
          throw new Error(`AI API returned ${res.status}. Please try again.`);
        }

        const data = await res.json();
        const reply = data?.reply;
        if (!reply) throw new Error("Empty response received from AI.");

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        console.error("AI chat error:", err);
        setError(
          err.message ||
            "Connection failed. Please check your internet and retry.",
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages],
  );

  const retry = useCallback(() => {
    if (!lastPrompt) return;
    setError(null);
    // Remove the last failed user message to re-send
    setMessages((prev) => {
      const lastUserIdx = [...prev]
        .reverse()
        .findIndex((m) => m.role === "user");
      if (lastUserIdx === -1) return prev;
      return prev.slice(0, prev.length - 1 - lastUserIdx);
    });
    sendMessage(lastPrompt);
  }, [lastPrompt, sendMessage]);

  const clearChat = () => {
    setMessages(INIT_MESSAGES);
    setError(null);
    setLastPrompt(null);
  };

  const bg2 = "var(--bg2)";
  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  return (
    <AppShell activePage="ai-assistant">
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 58px)",
          overflow: "hidden",
        }}
      >
        {/* ── Sidebar ── */}
        <div
          className="ai-sidebar"
          style={{
            width: 240,
            borderRight: `1px solid ${bord}`,
            background: bg2,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: t2,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "0 4px 4px",
            }}
          >
            Quick Prompts
          </div>
          {QUICK_TOPICS.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={i}
                onClick={() => sendMessage(t.prompt)}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 12px",
                  borderRadius: 11,
                  background: t.color,
                  border: `1px solid ${t.border}`,
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Icon size={14} color={t.text} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>
                  {t.label}
                </span>
              </button>
            );
          })}

          <div style={{ height: 1, background: bord, margin: "6px 0" }} />

          <button
            onClick={clearChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 11,
              background: "transparent",
              border: `1px solid ${bord}`,
              cursor: "pointer",
              color: t2,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Trash2 size={13} /> Clear Chat
          </button>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 11,
              background: "rgba(94,242,255,0.06)",
              border: "1px solid rgba(94,242,255,0.15)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#5ef2ff",
                marginBottom: 4,
              }}
            >
              🛡 Powered by
            </div>
            <div style={{ fontSize: 10, color: t2, lineHeight: 1.4 }}>
              Google Gemini 2.5 Flash — Real AI, no placeholders
            </div>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 11,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#f87171",
                marginBottom: 4,
              }}
            >
              🆘 Emergency?
            </div>
            <div
              style={{
                fontSize: 10,
                color: t2,
                marginBottom: 6,
                lineHeight: 1.4,
              }}
            >
              For life-threatening situations, call 112 immediately.
            </div>
            <a
              href="/sos"
              style={{
                display: "block",
                textAlign: "center",
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                textDecoration: "none",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Open Emergency Hub
            </a>
          </div>
        </div>

        {/* ── Chat ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${bord}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
              background: bg2,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(124,58,237,0.3)",
              }}
            >
              <Shield size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: t1 }}>
                SHEild AI Safety Copilot
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10b981",
                    animation: "aiPulse 2s infinite",
                  }}
                />
                Online — Gemini 2.5 Flash • English & Hindi
              </div>
            </div>
            <div style={{ fontSize: 11, color: t2 }}>
              {messages.filter((m) => m.role === "user").length} messages
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Shield size={14} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "#7c3aed"
                        : dark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                    border: msg.role === "user" ? "none" : `1px solid ${bord}`,
                    color: msg.role === "user" ? "#fff" : t1,
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#db2777)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield size={14} color="#fff" />
                </div>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: dark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.04)",
                    border: `1px solid ${bord}`,
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 0.2, 0.4].map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        animation: `aiDot 1.2s ${d}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error bar */}
          {error && (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(239,68,68,0.08)",
                borderTop: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, color: "#f87171" }}>⚠ {error}</span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={retry}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <RefreshCw size={11} /> Retry
                </button>
                <button
                  onClick={() => setError(null)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    background: "transparent",
                    border: `1px solid ${bord}`,
                    color: t2,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: `1px solid ${bord}`,
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              flexShrink: 0,
              background: bg2,
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about safety, routes, emergency guidance… (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1,
                background: surf,
                border: `1px solid ${bord}`,
                borderRadius: 12,
                padding: "11px 14px",
                fontSize: 13,
                color: t1,
                outline: "none",
                resize: "none",
                lineHeight: 1.5,
                fontFamily: "inherit",
                maxHeight: 120,
                overflowY: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background:
                  loading || !input.trim() ? "rgba(124,58,237,0.3)" : "#7c3aed",
                border: "none",
                color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    animation: "aiSpin 0.7s linear infinite",
                  }}
                />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aiPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes aiDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes aiSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:768px){.ai-sidebar{display:none!important}}
      `}</style>
    </AppShell>
  );
}
