import { useState } from "react";
import {
  Map,
  Navigation,
  Users,
  MessageSquare,
  Footprints,
  Clock,
  AlertOctagon,
  Lock,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    label: "AI Safety Heatmap",
    desc: "Live risk zones with Red, Orange, Green overlays and AI area scoring.",
    href: "/map",
    col: "#06b6d4",
  },
  {
    icon: Navigation,
    label: "Smart Safe Route",
    desc: "AI picks safest path — Lighting, Crowd and Women Safety scored.",
    href: "/safe-route",
    col: "#7c3aed",
  },
  {
    icon: Users,
    label: "Guardian Network",
    desc: "Family tracks your journey with real-time live location updates.",
    href: "/guardian",
    col: "#3b82f6",
  },
  {
    icon: Footprints,
    label: "Walk With Me AI",
    desc: "AI monitors every step, alerts guardians on inactivity.",
    href: "/walk",
    col: "#10b981",
  },
  {
    icon: Clock,
    label: "Smart Check-In",
    desc: "Missed arrival? Emergency contacts auto-notified instantly.",
    href: "/checkin",
    col: "#f59e0b",
  },
  {
    icon: MessageSquare,
    label: "Community Feed",
    desc: "Real-time social safety feed for your neighborhood.",
    href: "/feed",
    col: "#ec4899",
  },
  {
    icon: AlertOctagon,
    label: "Emergency Copilot",
    desc: "Siren + Flashlight + SMS + AI guidance for any emergency.",
    href: "/sos",
    col: "#ef4444",
  },
  {
    icon: Lock,
    label: "Evidence Vault",
    desc: "Timestamp-locked photos, audio and video evidence.",
    href: "/vault",
    col: "#6366f1",
  },
  {
    icon: MessageSquare,
    label: "AI Assistant",
    desc: "24/7 Gemini 2.5 Pro safety chat — always ready.",
    href: "/ai-assistant",
    col: "#8b5cf6",
  },
  {
    icon: BarChart3,
    label: "Safety Analytics",
    desc: "Risk profile, travel patterns and achievement badges.",
    href: "/analytics",
    col: "#14b8a6",
  },
];

const HERO_CARDS = [
  {
    href: "/map",
    icon: Map,
    label: "Safety Heatmap",
    desc: "Live Red/Orange/Green risk zones with AI-scored area intelligence and community reports",
    color: "#06b6d4",
    badge: "LIVE",
  },
  {
    href: "/safe-route",
    icon: Navigation,
    label: "Smart Safe Route",
    desc: "AI route planning with Safety Score, Lighting Score, Crowd Score and Women Safety Index",
    color: "#7c3aed",
    badge: "AI",
  },
  {
    href: "/sos",
    icon: AlertOctagon,
    label: "Emergency Center",
    desc: "One-tap: Siren alarm + Flashlight + GPS SMS + Fake call + AI emergency copilot",
    color: "#ef4444",
    badge: "SOS",
  },
  {
    href: "/ai-assistant",
    icon: MessageSquare,
    label: "AI Safety Copilot",
    desc: "Gemini 2.5 Pro answers safety questions, emergency protocols, route guidance 24/7",
    color: "#7c3aed",
    badge: "PRO",
  },
];

function HeroCard({
  href,
  icon: Icon,
  label,
  desc,
  color,
  badge,
  t1,
  t2,
  surf,
  bord,
  user,
  cta,
}) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={user ? href : cta}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        borderRadius: 20,
        background: hov ? color + "0E" : surf,
        border: `1px solid ${hov ? color + "45" : bord}`,
        padding: "22px 20px",
        transition: "all 0.22s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 20px 48px ${color}1A` : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            background: color + "18",
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hov ? `0 0 24px ${color}35` : "none",
            transition: "box-shadow 0.2s",
          }}
        >
          <Icon size={22} color={color} />
        </div>
        <span
          style={{
            background: color + "18",
            color: color,
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 6,
            letterSpacing: "0.06em",
            border: `1px solid ${color}30`,
          }}
        >
          {badge}
        </span>
      </div>
      <div
        style={{
          color: t1,
          fontSize: 16,
          fontWeight: 800,
          marginBottom: 8,
          letterSpacing: "-0.3px",
        }}
      >
        {label}
      </div>
      <div style={{ color: t2, fontSize: 13, lineHeight: 1.55, flex: 1 }}>
        {desc}
      </div>
      <div
        style={{
          marginTop: 16,
          color: color,
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 5,
          opacity: hov ? 1 : 0.7,
        }}
      >
        Open feature <span>→</span>
      </div>
    </a>
  );
}

export function FeaturesSection({ user, t1, t2, surf, bord, cta }) {
  return (
    <section
      id="features"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 20,
            border: "1px solid rgba(124,58,237,0.25)",
            background: "rgba(124,58,237,0.08)",
            fontSize: 10,
            fontWeight: 700,
            color: "#a78bfa",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          <Zap size={10} /> Core Safety Features
        </div>
        <h2
          style={{
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "-1.2px",
            color: t1,
            margin: "0 0 10px",
          }}
        >
          Every Feature Works.
          <br />
          <span style={{ color: t2, fontSize: 30 }}>
            No Placeholders. Real AI. Real Data.
          </span>
        </h2>
        <p style={{ fontSize: 14, color: t2, maxWidth: 500, margin: "0 auto" }}>
          Click any feature to open it directly — all connected to live AI, live
          GPS and real database.
        </p>
      </div>

      {/* 4 premium hero cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 16,
        }}
        className="prime-cards"
      >
        {HERO_CARDS.map((c, i) => (
          <HeroCard
            key={i}
            {...c}
            t1={t1}
            t2={t2}
            surf={surf}
            bord={bord}
            user={user}
            cta={cta}
          />
        ))}
      </div>

      {/* All features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
        }}
        className="feature-grid"
      >
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <a
              key={i}
              href={user ? f.href : cta}
              style={{
                padding: "14px 12px",
                borderRadius: 14,
                background: surf,
                border: `1px solid ${bord}`,
                textDecoration: "none",
                display: "block",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = f.col + "40";
                e.currentTarget.style.background = f.col + "0a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = bord;
                e.currentTarget.style.background = surf;
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: f.col + "18",
                  border: `1px solid ${f.col}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Icon size={13} color={f.col} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t1,
                  marginBottom: 3,
                  lineHeight: 1.3,
                }}
              >
                {f.label}
              </div>
              <div style={{ fontSize: 10, color: t2, lineHeight: 1.4 }}>
                {f.desc}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
