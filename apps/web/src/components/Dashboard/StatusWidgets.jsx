import { Cpu, Activity, Shield, ChevronRight } from "lucide-react";

export function StatusWidgets({ gpsStatus, weekActivity, theme }) {
  const bg2 = "var(--bg2)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* AI Status */}
      <div
        style={{
          padding: 18,
          borderRadius: 18,
          background: bg2,
          border: "1px solid " + bord,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={14} color="#fff" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: t1 }}>
            AI Systems
          </div>
        </div>
        {[
          { label: "Safety Engine", status: "Online", color: "#10b981" },
          {
            label: "Gemini 2.5 Pro",
            status: "Connected",
            color: "#10b981",
          },
          {
            label: "GPS Monitor",
            status: gpsStatus === "GPS Active" ? "Active" : "Waiting",
            color: gpsStatus === "GPS Active" ? "#10b981" : "#f59e0b",
          },
          {
            label: "Guardian Network",
            status: "Standby",
            color: "#3b82f6",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px solid " + bord,
            }}
          >
            <span style={{ fontSize: 11, color: t2 }}>{s.label}</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                fontWeight: 700,
                color: s.color,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: s.color,
                  display: "inline-block",
                }}
              />
              {s.status}
            </span>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div
        style={{
          padding: 18,
          borderRadius: 18,
          background: bg2,
          border: "1px solid " + bord,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: t1,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Activity size={14} color="#7c3aed" /> 7-Day Activity
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 48,
          }}
        >
          {weekActivity.map((v, i) => {
            const maxV = Math.max(...weekActivity, 1);
            const h = Math.max(4, (v / maxV) * 44);
            const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
            const dayIdx = (new Date().getDay() - 6 + i + 7) % 7;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: h,
                    borderRadius: 4,
                    background: i === 6 ? "#7c3aed" : "rgba(124,58,237,0.25)",
                    transition: "height 1s ease",
                  }}
                />
                <div style={{ fontSize: 8, color: t2 }}>{days[dayIdx]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency quick access */}
      <a
        href="/sos"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 16,
          borderRadius: 18,
          background: "rgba(239,68,68,0.09)",
          border: "1px solid rgba(239,68,68,0.22)",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(220,38,38,0.35)",
            flexShrink: 0,
          }}
        >
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: t1 }}>
            Emergency SOS
          </div>
          <div style={{ fontSize: 11, color: "#f87171" }}>
            One tap — alerts all contacts
          </div>
        </div>
        <ChevronRight
          size={16}
          color="#f87171"
          style={{ marginLeft: "auto" }}
        />
      </a>
    </div>
  );
}
