import { useState, useEffect } from "react";
import { Zap, ArrowRight, CheckCircle, Map, Bell, Shield } from "lucide-react";
import { RadarHero } from "@/components/Landing/RadarHero";

// ── Live IST Command Panel ────────────────────────────────────────
function CommandPanel({ dark, t1, t2 }) {
  const [istTime, setIstTime] = useState("");
  const surf = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
  const bord = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const hh = String(ist.getUTCHours()).padStart(2, "0");
      const mm = String(ist.getUTCMinutes()).padStart(2, "0");
      const ss = String(ist.getUTCSeconds()).padStart(2, "0");
      const dd = String(ist.getUTCDate()).padStart(2, "0");
      const mo = String(ist.getUTCMonth() + 1).padStart(2, "0");
      const yyyy = ist.getUTCFullYear();
      setIstTime(`${dd}/${mo}/${yyyy} ${hh}:${mm}:${ss} IST`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const metrics = [
    {
      label: "Safety Score",
      value: "87/100",
      color: "#10b981",
      icon: "🛡",
      badge: "LOW RISK",
    },
    {
      label: "GPS Status",
      value: "Active",
      color: "#06b6d4",
      icon: "📡",
      badge: "CONNECTED",
    },
    {
      label: "Active Guardians",
      value: "3",
      color: "#3b82f6",
      icon: "👥",
      badge: "ONLINE",
    },
    {
      label: "Community Risk",
      value: "Low",
      color: "#10b981",
      icon: "⚡",
      badge: "MONITORED",
    },
    {
      label: "SOS Status",
      value: "Ready",
      color: "#ef4444",
      icon: "🆘",
      badge: "ARMED",
    },
    {
      label: "AI Copilot",
      value: "Online",
      color: "#7c3aed",
      icon: "🤖",
      badge: "ACTIVE",
    },
  ];

  return (
    <div
      style={{
        background: dark ? "rgba(5,5,15,0.92)" : "rgba(255,255,255,0.96)",
        border: `1px solid ${dark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.15)"}`,
        borderRadius: 22,
        padding: "20px 22px",
        backdropFilter: "blur(24px)",
        boxShadow: dark
          ? "0 0 80px rgba(124,58,237,0.1),0 32px 64px rgba(0,0,0,0.4)"
          : "0 20px 60px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${bord}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
              <div
                key={c}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>
          <span
            style={{
              color: dark ? "#6b7280" : "#9ca3af",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "monospace",
            }}
          >
            SHEild AI · Command Center
          </span>
        </div>
        <span
          style={{
            color: dark ? "#52525b" : "#9ca3af",
            fontSize: 10,
            fontFamily: "monospace",
          }}
        >
          {istTime}
        </span>
      </div>

      {/* Metrics 2×3 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              background: m.color + "0C",
              border: `1px solid ${m.color}25`,
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span
                style={{
                  background: m.color + "18",
                  color: m.color,
                  fontSize: 7,
                  fontWeight: 800,
                  padding: "2px 5px",
                  borderRadius: 4,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {m.badge}
              </span>
            </div>
            <div
              style={{
                color: m.color,
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                color: dark ? "#6b7280" : "#9ca3af",
                fontSize: 9,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* SOS Ready bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 11,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(220,38,38,0.5)",
            flexShrink: 0,
          }}
        >
          <Shield size={14} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: t1 }}>
            Emergency SOS · Armed
          </div>
          <div style={{ fontSize: 9, color: t2, marginTop: 1 }}>
            Alarm + GPS SMS + Guardian alerts ready
          </div>
        </div>
        <div
          style={{
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.25)",
            fontSize: 9,
            fontWeight: 800,
            color: "#10b981",
          }}
        >
          ● LIVE
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ user, dark, t1, t2, cta, ctaLabel }) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 80,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <RadarHero />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark
            ? "linear-gradient(180deg,rgba(5,5,8,0.2) 0%,rgba(5,5,8,0.5) 60%,rgba(5,5,8,1) 100%)"
            : "linear-gradient(180deg,rgba(240,241,248,0.2),rgba(240,241,248,0.55) 60%,rgba(240,241,248,1) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px",
          display: "grid",
          gap: 56,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* LEFT */}
        <div>
          {/* Live badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 20,
              border: "1px solid rgba(124,58,237,0.3)",
              background: "rgba(124,58,237,0.1)",
              fontSize: 11,
              fontWeight: 700,
              color: "#a78bfa",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                boxShadow: "0 0 6px #10b981",
              }}
            />
            AI-Powered Safety Platform · Hackathon 2026
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.01,
              letterSpacing: "-2.5px",
              margin: "0 0 10px",
              color: t1,
            }}
            className="hero-h1"
          >
            Your Safety,
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg,#7c3aed,#c026d3,#db2777,#f43f5e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Predicted.
            </span>
          </h1>

          {/* Terminal tagline */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: dark ? "#6b7280" : "#9ca3af",
              marginBottom: 18,
              letterSpacing: "0.03em",
            }}
          >
            <span style={{ color: dark ? "#52525b" : "#d1d5db" }}>$ </span>
            <span style={{ color: dark ? "#a78bfa" : "#7c3aed" }}>sheild</span>
            <span style={{ color: dark ? "#10b981" : "#059669" }}>
              {" "}
              --protect
            </span>
            <span style={{ color: dark ? "#f59e0b" : "#d97706" }}>
              {" "}
              --ai-monitor
            </span>
            <span style={{ color: dark ? "#06b6d4" : "#0891b2" }}>
              {" "}
              --guardians
            </span>
            <span style={{ color: dark ? "#ec4899" : "#db2777" }}>
              {" "}
              --sos-ready
            </span>
          </div>

          <p
            style={{
              fontSize: 17,
              color: t2,
              lineHeight: 1.65,
              maxWidth: 500,
              margin: "0 0 30px",
            }}
          >
            Real-time AI threat prediction, guardian networks, voice SOS,
            evidence vault, community intelligence — the world's most complete
            women's safety platform.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 26,
            }}
          >
            <a
              href={cta}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 14,
                background: "#7c3aed",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 0 36px rgba(124,58,237,0.45)",
                letterSpacing: "-0.2px",
              }}
            >
              <Zap size={17} /> Launch Safety Console <ArrowRight size={15} />
            </a>
            <a
              href={user ? "/map" : "/account/signup"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 24px",
                borderRadius: 14,
                border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
                background: dark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
                color: t1,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              <Map size={16} /> View Live Demo
            </a>
          </div>

          {/* Trust chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {[
              "Live AI Monitoring",
              "GPS Protection",
              "Voice SOS",
              "Guardian Network",
              "IST Dashboard",
            ].map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: t2,
                }}
              >
                <CheckCircle size={13} color="#10b981" /> {f}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Command Center */}
        <div style={{ position: "relative" }} className="hero-preview">
          <CommandPanel dark={dark} t1={t1} t2={t2} />

          {/* Floating badges */}
          <div
            style={{
              position: "absolute",
              top: -14,
              right: -16,
              padding: "7px 13px",
              borderRadius: 10,
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              backdropFilter: "blur(8px)",
              fontSize: 11,
              fontWeight: 700,
              color: "#10b981",
              animation: "lFloat 3s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}
          >
            🛡 AI Shield Active
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -14,
              left: -16,
              padding: "7px 13px",
              borderRadius: 10,
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              backdropFilter: "blur(8px)",
              fontSize: 11,
              fontWeight: 700,
              color: "#a78bfa",
              animation: "lFloat 3s 1.5s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}
          >
            🤖 Gemini 2.5 Pro Online
          </div>
        </div>
      </div>
    </section>
  );
}
