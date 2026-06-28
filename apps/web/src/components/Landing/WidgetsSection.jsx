import { Activity } from "lucide-react";
import { Shield } from "lucide-react";

const ALERTS = [
  {
    icon: "🔴",
    text: "High-risk activity reported — Central Park North",
    time: "2m ago",
  },
  {
    icon: "🟢",
    text: "Guardian check-in confirmed — User arrived safely",
    time: "4m ago",
  },
  {
    icon: "🟡",
    text: "Poor lighting reported — 8th Ave & 42nd St",
    time: "9m ago",
  },
  {
    icon: "🆘",
    text: "Community SOS resolved — Officers on scene",
    time: "14m ago",
  },
  {
    icon: "🔵",
    text: "Safe route added — Broadway Corridor now clear",
    time: "21m ago",
  },
];

export function WidgetsSection({ user, t1, t2, surf, bord, cta }) {
  return (
    <section
      style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 32px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
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
          <Activity size={10} /> Live Platform Preview
        </div>
        <h2
          style={{
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "-1px",
            color: t1,
            margin: "0 0 10px",
          }}
        >
          Widgets That Actually Work
        </h2>
        <p style={{ fontSize: 14, color: t2, maxWidth: 520, margin: "0 auto" }}>
          Every widget below connects to a real page. Click any card to go
          there.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
        }}
        className="widget-grid"
      >
        {/* SOS Widget */}
        <a
          href={cta}
          style={{
            padding: 20,
            borderRadius: 20,
            background: surf,
            border: "1px solid rgba(239,68,68,0.2)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            ⚡ Emergency SOS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#dc2626",
                boxShadow: "0 0 28px rgba(220,38,38,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Shield size={28} color="#fff" />
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: t1,
                marginBottom: 5,
              }}
            >
              One-Tap Emergency Alert
            </div>
            <div style={{ fontSize: 11, color: t2 }}>
              Alarm + live location + guardian alerts
            </div>
          </div>
        </a>
        {/* Guardian Widget */}
        <a
          href={user ? "/guardian" : cta}
          style={{
            padding: 20,
            borderRadius: 20,
            background: surf,
            border: "1px solid rgba(59,130,246,0.2)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#60a5fa",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            👥 Guardian Network
          </div>
          {[
            { n: "Emma", s: "Tracking", c: "#10b981" },
            { n: "Sarah", s: "Standing by", c: "#f59e0b" },
            { n: "Maya", s: "Offline", c: "#6b7280" },
          ].map((g) => (
            <div
              key={g.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: `1px solid ${bord}`,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {g.n[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t1 }}>
                  {g.n}
                </div>
                <div style={{ fontSize: 10, color: g.c, fontWeight: 600 }}>
                  ● {g.s}
                </div>
              </div>
            </div>
          ))}
        </a>
        {/* Live Alert Feed */}
        <a
          href={user ? "/feed" : cta}
          style={{
            padding: 20,
            borderRadius: 20,
            background: surf,
            border: "1px solid rgba(245,158,11,0.2)",
            textDecoration: "none",
            display: "block",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#fbbf24",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Real-Time Alert Feed
            </span>
          </div>
          {ALERTS.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                padding: "7px 0",
                borderBottom:
                  i < ALERTS.length - 1 ? `1px solid ${bord}` : "none",
                opacity: 0.35 + (0.65 * (ALERTS.length - i)) / ALERTS.length,
              }}
            >
              <span style={{ fontSize: 12, flexShrink: 0 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: t1, lineHeight: 1.35 }}>
                  {a.text}
                </div>
                <div style={{ fontSize: 9, color: t2, marginTop: 1 }}>
                  {a.time}
                </div>
              </div>
            </div>
          ))}
        </a>
      </div>
    </section>
  );
}
