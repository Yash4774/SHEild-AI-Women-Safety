import { MapPin } from "lucide-react";
import { useISTClock } from "@/hooks/useGPSLocation";

export function DashboardHeader({
  greeting,
  timeGreet,
  gpsStatus,
  cityName,
  theme,
}) {
  const clock = useISTClock();
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  const gpsCfg =
    gpsStatus === "connected"
      ? {
          color: "#10b981",
          bg: "rgba(16,185,129,0.1)",
          border: "rgba(16,185,129,0.22)",
          label: cityName || "GPS Connected",
          pulse: false,
        }
      : gpsStatus === "acquiring"
        ? {
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
            border: "rgba(245,158,11,0.22)",
            label: "Acquiring GPS...",
            pulse: true,
          }
        : {
            color: "#ef4444",
            bg: "rgba(239,68,68,0.1)",
            border: "rgba(239,68,68,0.22)",
            label: "GPS Offline",
            pulse: false,
          };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: t1,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            {timeGreet}, {greeting} 👋
          </h1>
          <p style={{ fontSize: 13, color: t2, marginTop: 4 }}>
            Your AI command center is active and monitoring.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Live IST Clock */}
          <div
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.22)",
              textAlign: "center",
              minWidth: 118,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#a78bfa",
                fontFamily: "monospace",
                letterSpacing: "0.02em",
                lineHeight: 1.2,
              }}
            >
              {clock.time}
            </div>
            <div
              style={{
                fontSize: 9,
                color: t2,
                fontWeight: 700,
                letterSpacing: "0.05em",
                marginTop: 2,
              }}
            >
              {clock.date} IST
            </div>
          </div>
          {/* GPS city badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 10,
              background: gpsCfg.bg,
              border: `1px solid ${gpsCfg.border}`,
              fontSize: 11,
              fontWeight: 700,
              color: gpsCfg.color,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: gpsCfg.color,
                animation: gpsCfg.pulse ? "dbPulse 1s infinite" : "none",
              }}
            />
            {gpsCfg.label}
          </div>
          {/* Shield badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.22)",
              fontSize: 12,
              fontWeight: 700,
              color: "#10b981",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                animation: "dbPulse 2s infinite",
              }}
            />
            AI Shield Active
          </div>
        </div>
      </div>

      {/* IST Status bar */}
      <div
        style={{
          display: "flex",
          gap: 14,
          padding: "8px 14px",
          borderRadius: 11,
          background: "rgba(124,58,237,0.04)",
          border: "1px solid rgba(124,58,237,0.1)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {[
          {
            label: "GPS",
            val:
              gpsStatus === "connected"
                ? cityName || "Connected"
                : gpsStatus === "acquiring"
                  ? "Acquiring..."
                  : "Offline",
            color: gpsCfg.color,
          },
          { label: "AI Engine", val: "Online", color: "#10b981" },
          { label: "SOS", val: "Armed", color: "#10b981" },
          { label: "Guardian Net", val: "Standby", color: "#3b82f6" },
          { label: "IST", val: clock.full, color: "#a78bfa" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: t2,
            }}
          >
            {i > 0 && <span style={{ opacity: 0.15, marginRight: 4 }}>|</span>}
            <span style={{ fontWeight: 600 }}>{s.label}:</span>
            <span style={{ fontWeight: 800, color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
