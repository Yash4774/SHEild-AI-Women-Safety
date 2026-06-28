import { AlertOctagon, Users, Shield, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";

export function KPICards({ reports, feedPosts, sosHistory, loaded, theme }) {
  const bg2 = "var(--bg2)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  const stats = [
    {
      label: "Reports Filed",
      val: reports.length,
      icon: AlertOctagon,
      color: "#ef4444",
      spark: [2, 4, 3, 6, 5, reports.length, reports.length + 1].map((v) =>
        Math.max(0, v),
      ),
      trend: "+12%",
    },
    {
      label: "Community Posts",
      val: feedPosts.length,
      icon: Users,
      color: "#ec4899",
      spark: [1, 3, 2, 4, 3, feedPosts.length, feedPosts.length + 1].map((v) =>
        Math.max(0, v),
      ),
      trend: "Active",
    },
    {
      label: "SOS Activations",
      val: sosHistory.length,
      icon: Shield,
      color: "#7c3aed",
      spark: [0, 1, 0, 1, 0, sosHistory.length, 0].map((v) => Math.max(0, v)),
      trend: "Monitored",
    },
    {
      label: "Safety Score",
      val: "87",
      icon: TrendingUp,
      color: "#10b981",
      spark: [75, 78, 80, 83, 82, 86, 87],
      trend: "↑ +3pts",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        marginBottom: 20,
      }}
      className="db-kpi-grid"
    >
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            style={{
              padding: "18px 20px",
              borderRadius: 18,
              background: bg2,
              border: "1px solid " + bord,
              position: "relative",
              overflow: "hidden",
              animation: "dbIn 0.4s " + i * 0.07 + "s ease both",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: "0 0 0 100px",
                background: s.color + "08",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: s.color + "16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color={s.color} />
              </div>
              <Sparkline values={s.spark} color={s.color} />
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: t1,
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              {loaded ? s.val : "·"}
            </div>
            <div style={{ fontSize: 11, color: t2, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>
              {s.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
}
