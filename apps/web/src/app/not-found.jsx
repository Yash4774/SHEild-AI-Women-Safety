import { Shield, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg1, #050508)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "linear-gradient(135deg,#7c3aed,#db2777)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 40px rgba(124,58,237,0.3)",
          }}
        >
          <Shield size={30} color="#fff" />
        </div>

        {/* 404 */}
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg,#7c3aed,#db2777)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 16,
            letterSpacing: "-4px",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "var(--text1,#fff)",
            margin: "0 0 12px",
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--text2,#a1a1aa)",
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          The page you're looking for doesn't exist or has been moved. Use the
          navigation below to find your way back.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(124,58,237,0.3)",
            }}
          >
            <Home size={15} /> Go Home
          </a>
          <a
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text1,#fff)",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Dashboard
          </a>
        </div>

        {/* Quick links */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text2,#a1a1aa)",
              marginBottom: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Popular Pages
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Safety Map", href: "/map" },
              { label: "Safe Route", href: "/safe-route" },
              { label: "Guardian", href: "/guardian" },
              { label: "AI Assistant", href: "/ai-assistant" },
              { label: "Emergency", href: "/sos" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  color: "#a78bfa",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
