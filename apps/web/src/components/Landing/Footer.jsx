import {
  Shield,
  Github,
  Twitter,
  Linkedin,
  Heart,
  ExternalLink,
} from "lucide-react";

const FOOTER_PRODUCT = [
  { label: "Safety Dashboard", href: "/dashboard" },
  { label: "Safety Heatmap", href: "/map" },
  { label: "Safe Route Planner", href: "/safe-route" },
  { label: "Guardian Network", href: "/guardian" },
  { label: "AI Copilot", href: "/ai-assistant" },
  { label: "Community Feed", href: "/feed" },
];

const FOOTER_TOOLS = [
  { label: "Emergency SOS Hub", href: "/sos" },
  { label: "Evidence Vault", href: "/vault" },
  { label: "Smart Check-In", href: "/checkin" },
  { label: "Walk With Me", href: "/walk" },
  { label: "Analytics", href: "/analytics" },
  { label: "Safety DNA", href: "/profile" },
];

const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Cookie Policy", href: "#cookies" },
  { label: "Contact Us", href: "#contact" },
  { label: "Help Center", href: "#help" },
];

const SOCIALS = [
  { icon: Github, href: "#github", label: "GitHub" },
  { icon: Twitter, href: "#twitter", label: "Twitter" },
  { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
];

export function Footer({ bord, t1, t2 }) {
  return (
    <footer
      style={{
        borderTop: `1px solid ${bord}`,
        paddingTop: 56,
        paddingBottom: 32,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle neon top accent */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "15%",
          right: "15%",
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),rgba(219,39,119,0.4),transparent)",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* ── Main Footer Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                  flexShrink: 0,
                }}
              >
                <Shield size={17} color="#fff" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    letterSpacing: "-0.4px",
                    color: t1,
                    lineHeight: 1.1,
                  }}
                >
                  SHEild<span style={{ color: "#a78bfa" }}> AI</span>
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: "#10b981",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  ● Shield Active
                </div>
              </div>
            </a>
            <p
              style={{
                fontSize: 13,
                color: t2,
                lineHeight: 1.65,
                maxWidth: 280,
                marginBottom: 20,
              }}
            >
              The world's most advanced AI-powered women's safety platform.
              Real-time threat prediction, guardian networks, voice SOS, and
              community intelligence — all in one place.
            </p>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.22)",
                fontSize: 11,
                fontWeight: 700,
                color: "#a78bfa",
                marginBottom: 20,
              }}
            >
              🏆 National Hackathon 2026
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${bord}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t2,
                    textDecoration: "none",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#a78bfa";
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)";
                    e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = t2;
                    e.currentTarget.style.borderColor = bord;
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Product column */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: t1,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Product
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_PRODUCT.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 13,
                    color: t2,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a78bfa")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = t2)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Safety Tools column */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: t1,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Safety Tools
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_TOOLS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 13,
                    color: t2,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a78bfa")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = t2)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal column */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: t1,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Company
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_LEGAL.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 13,
                    color: t2,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a78bfa")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = t2)}
                >
                  {l.label}
                </a>
              ))}
              {/* GitHub link with icon */}
              <a
                href="#github"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  color: t2,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = t2)}
              >
                <Github size={12} /> View on GitHub <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          style={{
            borderTop: `1px solid ${bord}`,
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: t2,
            }}
          >
            © 2026 SHEild AI. Made with{" "}
            <Heart size={11} color="#db2777" style={{ display: "inline" }} />{" "}
            for women's safety worldwide.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    fontSize: 11,
                    color: t2,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a78bfa")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = t2)}
                >
                  {label}
                </a>
              ),
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              fontSize: 10,
              fontWeight: 700,
              color: "#10b981",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#10b981",
                animation: "footerPulse 2s infinite",
              }}
            />
            All Systems Operational
          </div>
        </div>
      </div>

      <style>{`
        @keyframes footerPulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @media(max-width:900px){
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
        @media(max-width:520px){
          .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </footer>
  );
}
