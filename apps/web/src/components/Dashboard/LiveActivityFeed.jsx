import { Radio, ChevronRight } from "lucide-react";

const LIVE_ALERTS = [
  {
    icon: "🔴",
    text: "High-risk activity reported near Central Park",
    time: "2m ago",
    color: "#ef4444",
  },
  {
    icon: "🟢",
    text: "Guardian check-in confirmed — arrived safely",
    time: "5m ago",
    color: "#10b981",
  },
  {
    icon: "🟡",
    text: "Poor lighting flagged — 8th Ave & 42nd St",
    time: "12m ago",
    color: "#f59e0b",
  },
  {
    icon: "🆘",
    text: "SOS resolved — Officers on scene",
    time: "18m ago",
    color: "#ef4444",
  },
  {
    icon: "🔵",
    text: "Safe route update — Broadway corridor clear",
    time: "24m ago",
    color: "#3b82f6",
  },
];

export function LiveActivityFeed({ reports, alertIdx, theme }) {
  const bg2 = "var(--bg2)";
  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 22,
        background: bg2,
        border: "1px solid " + bord,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <Radio size={15} color="#ef4444" />
        <div style={{ fontSize: 15, fontWeight: 800, color: t1 }}>
          Live Alert Feed
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "#10b981",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              animation: "dbPulse 1.5s infinite",
            }}
          />
          LIVE
        </div>
      </div>

      {LIVE_ALERTS.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: i === alertIdx ? surf : "transparent",
            border: "1px solid " + (i === alertIdx ? bord : "transparent"),
            marginBottom: 6,
            transition: "all 0.3s",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: t1,
                lineHeight: 1.4,
                marginBottom: 2,
              }}
            >
              {a.text}
            </div>
            <div style={{ fontSize: 10, color: t2 }}>{a.time}</div>
          </div>
        </div>
      ))}

      <div style={{ height: 1, background: bord, margin: "14px 0" }} />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: t2,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        Recent Community Reports
      </div>
      {reports.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            color: t2,
            fontSize: 12,
          }}
        >
          No reports yet — be the first!
        </div>
      ) : (
        reports.slice(0, 4).map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < 3 ? "1px solid " + bord : "none",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  r.danger_level === "high"
                    ? "#ef4444"
                    : r.danger_level === "medium"
                      ? "#f59e0b"
                      : "#10b981",
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: t1,
                  textTransform: "capitalize",
                }}
              >
                {r.category || "Safety"} Alert
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t2,
                  marginTop: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.description || "No description"}
              </div>
            </div>
            <div style={{ fontSize: 10, color: t2, flexShrink: 0 }}>
              {new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
        ))
      )}
      <a
        href="/feed"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          marginTop: 12,
          padding: "8px",
          borderRadius: 10,
          fontSize: 12,
          color: "#a78bfa",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        View Full Community Feed <ChevronRight size={12} />
      </a>
    </div>
  );
}
