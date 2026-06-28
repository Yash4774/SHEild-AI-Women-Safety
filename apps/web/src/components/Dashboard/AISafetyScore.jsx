import { Zap, Navigation, CheckCircle } from "lucide-react";

export function AISafetyScore({
  destination,
  setDestination,
  calculating,
  calculateScore,
  error,
  safetyScore,
  theme,
}) {
  const dark = theme === "dark";
  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";

  const score = safetyScore?.score ?? 0;
  const scoreColor =
    score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 22,
        background:
          "linear-gradient(135deg," +
          (dark ? "rgba(124,58,237,0.16)" : "rgba(124,58,237,0.08)") +
          ",transparent)",
        border: "1px solid rgba(124,58,237,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={17} color="#a78bfa" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: t1 }}>
            AI Safety Score
          </div>
          <div style={{ fontSize: 11, color: t2 }}>
            Powered by Gemini 2.5 Pro
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculateScore()}
          placeholder="Enter your destination..."
          style={{
            flex: 1,
            background: surf,
            border: "1px solid " + bord,
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            color: t1,
            outline: "none",
          }}
        />
        <button
          onClick={calculateScore}
          disabled={calculating || !destination.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: calculating ? "rgba(124,58,237,0.4)" : "#7c3aed",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: calculating ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {calculating ? "Analyzing..." : "Calculate"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "#f87171",
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {calculating && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 16,
            borderRadius: 14,
            background: surf,
            border: "1px solid " + bord,
          }}
        >
          {[
            "Analyzing time of day & night risk...",
            "Checking community reports...",
            "Evaluating route safety factors...",
            "Generating personalized score...",
          ].map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: t2,
                animation: "dbIn 0.3s " + i * 0.15 + "s ease both",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#7c3aed",
                  animation: "dbPulse 1.2s " + i * 0.3 + "s infinite",
                }}
              />
              {msg}
            </div>
          ))}
        </div>
      )}

      {safetyScore && !calculating && (
        <div style={{ animation: "dbIn 0.5s ease both" }}>
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: scoreColor + "12",
              border: "1px solid " + scoreColor + "30",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: t2,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  Safety Score
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: scoreColor,
                    lineHeight: 1,
                  }}
                >
                  {score}
                  <span style={{ fontSize: 20, color: t2 }}>/100</span>
                </div>
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  background: scoreColor + "22",
                  border: "1px solid " + scoreColor + "35",
                  fontSize: 12,
                  fontWeight: 800,
                  color: scoreColor,
                }}
              >
                {safetyScore.risk_level} Risk
              </div>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: surf,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: score + "%",
                  background:
                    "linear-gradient(90deg," +
                    scoreColor +
                    "80," +
                    scoreColor +
                    ")",
                  borderRadius: 4,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>

          {safetyScore.reason && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: surf,
                border: "1px solid " + bord,
                fontSize: 12,
                color: t2,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              <span style={{ color: "#a78bfa", fontWeight: 700 }}>Why: </span>
              {safetyScore.reason}
            </div>
          )}

          {safetyScore.factors && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {Object.entries(safetyScore.factors).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: surf,
                    border: "1px solid " + bord,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: t2,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 3,
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 11, color: t1, lineHeight: 1.3 }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: t2,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Recommendations
          </div>
          {(safetyScore.recommendations || []).slice(0, 3).map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
                fontSize: 12,
                color: t2,
              }}
            >
              <CheckCircle
                size={12}
                color="#10b981"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              {r}
            </div>
          ))}

          <a
            href="/safe-route"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
              padding: "10px",
              borderRadius: 12,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.22)",
              color: "#a78bfa",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Navigation size={13} /> Plan Safe Route
          </a>
        </div>
      )}

      {!safetyScore && !calculating && (
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Zap size={22} color="#7c3aed" />
          </div>
          <div style={{ fontSize: 13, color: t2 }}>
            Enter a destination above to get a personalized AI safety score
            based on time, location, and community reports.
          </div>
        </div>
      )}
    </div>
  );
}
