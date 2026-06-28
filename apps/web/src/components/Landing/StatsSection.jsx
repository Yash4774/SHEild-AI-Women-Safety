export function StatsSection({ bord, surf, t1, t2 }) {
  const stats = [
    { v: "24/7", l: "AI Monitoring", icon: "🛡", sub: "Always protecting" },
    { v: "< 2s", l: "SOS Response", icon: "⚡", sub: "Instant alarm" },
    { v: "GPS", l: "Live Protection", icon: "📡", sub: "Real-time location" },
    { v: "AI", l: "Route Analysis", icon: "🗺", sub: "Smart safe paths" },
  ];

  return (
    <section
      style={{
        borderTop: `1px solid ${bord}`,
        borderBottom: `1px solid ${bord}`,
        background: surf,
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          textAlign: "center",
        }}
        className="stats-grid"
      >
        {stats.map((s) => (
          <div key={s.l} style={{ padding: "8px 4px" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 4,
                letterSpacing: "-1px",
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 12,
                color: t1,
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              {s.l}
            </div>
            <div style={{ fontSize: 10, color: t2, fontWeight: 500 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
