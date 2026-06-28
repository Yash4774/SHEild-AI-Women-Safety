import {
  Map,
  Navigation,
  Footprints,
  Clock,
  MessageSquare,
  AlertOctagon,
  Lock,
  Cpu,
  Zap,
} from "lucide-react";

const QUICK_LINKS = [
  {
    label: "Safety Heatmap",
    desc: "Live risk zones",
    icon: Map,
    col: "#06b6d4",
    href: "/map",
  },
  {
    label: "Safe Route",
    desc: "AI-optimized paths",
    icon: Navigation,
    col: "#7c3aed",
    href: "/safe-route",
  },
  {
    label: "Walk With Me",
    desc: "AI walk monitor",
    icon: Footprints,
    col: "#10b981",
    href: "/walk",
  },
  {
    label: "Smart Check-In",
    desc: "Auto safety alerts",
    icon: Clock,
    col: "#f59e0b",
    href: "/checkin",
  },
  {
    label: "Safety Feed",
    desc: "Community reports",
    icon: MessageSquare,
    col: "#ec4899",
    href: "/feed",
  },
  {
    label: "Emergency Hub",
    desc: "SOS + Fake Call",
    icon: AlertOctagon,
    col: "#ef4444",
    href: "/sos",
  },
  {
    label: "Evidence Vault",
    desc: "Secure uploads",
    icon: Lock,
    col: "#6366f1",
    href: "/vault",
  },
  {
    label: "AI Assistant",
    desc: "24/7 AI safety chat",
    icon: Cpu,
    col: "#8b5cf6",
    href: "/ai-assistant",
  },
];

export function QuickAccessGrid({ theme }) {
  const bg2 = "var(--bg2)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Zap size={15} color="#7c3aed" />
        <span style={{ fontSize: 14, fontWeight: 800, color: t1 }}>
          Quick Access
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 10,
        }}
        className="db-quick-grid"
      >
        {QUICK_LINKS.map((link, i) => {
          const Icon = link.icon;
          return (
            <a
              key={i}
              href={link.href}
              style={{
                padding: "14px 10px",
                borderRadius: 16,
                background: bg2,
                border: "1px solid " + bord,
                textDecoration: "none",
                textAlign: "center",
                display: "block",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = link.col + "45";
                e.currentTarget.style.background = link.col + "0d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = bord;
                e.currentTarget.style.background = bg2;
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: link.col + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <Icon size={14} color={link.col} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t1,
                  lineHeight: 1.3,
                  marginBottom: 2,
                }}
              >
                {link.label}
              </div>
              <div style={{ fontSize: 9, color: t2 }}>{link.desc}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
