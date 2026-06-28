"use client";
import { useState, useEffect, useRef } from "react";
import useUser from "@/utils/useUser";
import {
  Shield,
  Zap,
  Map,
  Users,
  Lock,
  Navigation,
  MessageSquare,
  Clock,
  AlertOctagon,
  Eye,
  Activity,
  ChevronRight,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// ── Color tokens ─────────────────────────────────────────────────────
const C = {
  bg: "#05070A",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.06)",
  cyan: "#5EF2FF",
  purple: "#8B5CF6",
  pink: "#FF4FD8",
  text1: "#FFFFFF",
  text2: "#94A3B8",
  text3: "#475569",
};

// ── Glow orb ─────────────────────────────────────────────────────────
function GlowOrb({ color, size = 400, x, y, opacity = 0.12 }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(100px)",
        left: x,
        top: y,
        opacity,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Glass card ───────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hoverGlow = C.cyan }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${hovered ? hoverGlow + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 20,
        transition: "all 0.3s ease",
        boxShadow: hovered
          ? `0 0 30px ${hoverGlow}18, inset 0 1px 0 rgba(255,255,255,0.08)`
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────
function AnimCounter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const t = setInterval(() => {
            start += step;
            if (start >= target) {
              setVal(target);
              clearInterval(t);
            } else setVal(Math.round(start));
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ── Neon button ──────────────────────────────────────────────────────
function NeonButton({
  children,
  href,
  onClick,
  variant = "primary",
  style = {},
}) {
  const [hov, setHov] = useState(false);
  const isPrimary = variant === "primary";
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "13px 28px",
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
        textDecoration: "none",
        transition: "all 0.25s ease",
        background: isPrimary
          ? `linear-gradient(135deg, ${C.purple}, ${C.pink})`
          : "rgba(94,242,255,0.08)",
        border: isPrimary ? "none" : `1px solid rgba(94,242,255,0.25)`,
        color: isPrimary ? "#fff" : C.cyan,
        boxShadow: hov
          ? isPrimary
            ? `0 0 32px ${C.purple}60, 0 8px 24px rgba(0,0,0,0.4)`
            : `0 0 20px ${C.cyan}30`
          : isPrimary
            ? `0 0 16px ${C.purple}30`
            : "none",
        transform: hov ? "translateY(-1px)" : "none",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ── Features ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Map,
    title: "AI Safety Map",
    desc: "Real-time danger zones, heatmaps and community incident reports layered on live Google Maps.",
    color: C.cyan,
    href: "/map",
  },
  {
    icon: Zap,
    title: "AI Risk Engine",
    desc: "Gemini AI predicts route danger using time of day, crime density, crowd levels and your history.",
    color: C.purple,
    href: "/safe-route",
  },
  {
    icon: AlertOctagon,
    title: "Emergency Console",
    desc: "One-tap SOS, fake call, voice activation, flashlight signal and instant guardian alerts.",
    color: C.pink,
    href: "/sos",
  },
  {
    icon: Users,
    title: "Guardian Mesh",
    desc: "Live GPS sharing with trusted contacts. Real-time tracking dashboard. Auto-alert on missed check-ins.",
    color: "#34D399",
    href: "/guardian",
  },
  {
    icon: MessageSquare,
    title: "AI Safety Coach",
    desc: "Gemini-powered personal assistant. Emergency guidance in English and Hindi, 24/7.",
    color: "#FBBF24",
    href: "/ai-assistant",
  },
  {
    icon: Activity,
    title: "Safety DNA",
    desc: "AI-generated personal safety profile from your real activity data. Score, strengths, weaknesses.",
    color: "#F472B6",
    href: "/profile",
  },
];

// ── Live Stats ────────────────────────────────────────────────────────
const STATS = [
  { val: 0.4, suffix: "s", label: "Alert Dispatch" },
  { val: 24, suffix: "/7", label: "AI Monitoring" },
  { val: 100, suffix: "%", label: "Encrypted" },
  { val: 99.98, suffix: "%", label: "Uptime" },
];

// ── Main ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { data: user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const cta = user ? "/dashboard" : "/account/signup";
  const ctaLabel = user ? "Launch Console →" : "Activate SHEild AI →";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        background: C.bg,
        color: C.text1,
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}
    >
      {/* ── Navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          background: scrolled ? "rgba(5,7,10,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          padding: "0 max(24px, calc((100vw - 1200px)/2))",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            marginRight: "auto",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.purple},${C.pink})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${C.purple}50`,
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: "-0.5px",
                background: `linear-gradient(135deg,#fff,${C.cyan})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SHEild<span style={{ WebkitTextFillColor: C.purple }}> AI</span>
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.text3,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: -2,
              }}
            >
              V4 COMMAND CENTER
            </div>
          </div>
        </a>

        {/* Status chips — desktop */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginRight: 24,
          }}
          className="land-desktop"
        >
          {[
            { dot: "#10b981", label: "Systems Online" },
            { dot: C.cyan, label: "Node-42" },
            { dot: C.purple, label: "Latency 47ms" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 10,
                fontWeight: 700,
                color: C.text2,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: s.dot,
                  animation: "landPulse 2s ease infinite",
                }}
              />
              {s.label}
            </div>
          ))}
        </div>

        {/* Right actions — desktop */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 10 }}
          className="land-desktop"
        >
          <a
            href="/account/signin"
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: C.text2,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Sign In
          </a>
          <NeonButton href={cta} style={{ padding: "9px 20px", fontSize: 13 }}>
            {user ? "Dashboard" : "Activate"}
          </NeonButton>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: 8,
            color: C.text2,
            cursor: "pointer",
          }}
          className="land-mobile"
        >
          {mobileMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(5,7,10,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <a
            href="/account/signin"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              color: C.text2,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Sign In
          </a>
          <NeonButton href={cta}>
            {user ? "Dashboard" : "Activate SHEild AI"}
          </NeonButton>
        </div>
      )}

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "120px 24px 80px",
          overflow: "hidden",
        }}
      >
        {/* Background orbs — parallax */}
        <GlowOrb
          color={C.purple}
          size={700}
          x={`calc(${mousePos.x * 60}px - 200px)`}
          y={`calc(${mousePos.y * 40}px - 100px)`}
          opacity={0.14}
        />
        <GlowOrb
          color={C.cyan}
          size={500}
          x={`calc(100% - ${mousePos.x * 60}px - 300px)`}
          y={`calc(60% - ${mousePos.y * 40}px)`}
          opacity={0.08}
        />
        <GlowOrb
          color={C.pink}
          size={400}
          x={`calc(50% + ${mousePos.x * 30}px)`}
          y="70%"
          opacity={0.07}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(94,242,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(94,242,255,0.03) 1px,transparent 1px)`,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              background: `rgba(94,242,255,0.08)`,
              border: `1px solid rgba(94,242,255,0.2)`,
              fontSize: 12,
              fontWeight: 700,
              color: C.cyan,
              marginBottom: 32,
              letterSpacing: "0.08em",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.cyan,
                animation: "landPulse 1.5s infinite",
              }}
            />
            AI-POWERED WOMEN'S SAFETY PLATFORM V4
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(44px, 8vw, 90px)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-3px",
              marginBottom: 24,
            }}
          >
            <span style={{ display: "block" }}>YOUR SAFETY.</span>
            <span
              style={{
                display: "block",
                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple}, ${C.pink})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200%",
                animation: "gradShift 4s ease infinite",
              }}
            >
              PREDICTED.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 17,
              color: C.text2,
              lineHeight: 1.7,
              maxWidth: 620,
              margin: "0 auto 48px",
            }}
          >
            The world's most advanced AI-powered women's safety platform. Real
            GPS. Real AI. Real-time protection. No fake data.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginBottom: 48,
            }}
          >
            {[
              "Live GPS",
              "AI Risk Prediction",
              "Guardian Network",
              "Emergency SOS",
              "Safety Heatmap",
              "Smart Check-ins",
              "Evidence Vault",
              "AI Safety Coach",
            ].map((f) => (
              <span
                key={f}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 12,
                  color: C.text2,
                  fontWeight: 600,
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <NeonButton
              href={cta}
              style={{ padding: "15px 32px", fontSize: 15 }}
            >
              {ctaLabel} <ArrowRight size={16} />
            </NeonButton>
            <NeonButton
              href="#features"
              variant="secondary"
              style={{ padding: "15px 32px", fontSize: 15 }}
            >
              See Systems
            </NeonButton>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🔒", label: "End-to-End Encrypted" },
              { icon: "🛡", label: "Real GPS — No Fake Data" },
              { icon: "🤖", label: "Gemini AI Powered" },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: C.text3,
                  fontWeight: 600,
                }}
              >
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section
        style={{
          padding: "60px max(24px, calc((100vw - 1200px)/2))",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
            maxWidth: 900,
            margin: "0 auto",
          }}
          className="land-stats-grid"
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "clamp(32px, 5vw, 52px)",
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                <AnimCounter target={s.val} suffix={s.suffix} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.text3,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{ padding: "100px max(24px, calc((100vw - 1200px)/2))" }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.purple,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 14,
            }}
          >
            COMMAND SYSTEMS
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: 16,
            }}
          >
            Every Safety System,
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.pink})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Fully Connected.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: C.text2,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Real backends. Real APIs. Real emergency response — not demo data.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            maxWidth: 1200,
            margin: "0 auto",
          }}
          className="land-feature-grid"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <GlassCard
                key={f.title}
                hoverGlow={f.color}
                style={{
                  padding: 28,
                  animation: `landIn 0.6s ${i * 0.08}s ease both`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} color={f.color} />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 10,
                    background: `linear-gradient(135deg,#fff,${f.color})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: C.text2,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {f.desc}
                </p>
                <a
                  href={f.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: f.color,
                    textDecoration: "none",
                  }}
                >
                  Open System <ChevronRight size={13} />
                </a>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "100px max(24px, calc((100vw - 1200px)/2))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GlowOrb color={C.purple} size={600} x="20%" y="-20%" opacity={0.15} />
        <GlowOrb color={C.pink} size={500} x="60%" y="30%" opacity={0.1} />

        <GlassCard
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "70px 48px",
            textAlign: "center",
            position: "relative",
            border: `1px solid rgba(139,92,246,0.3)`,
            boxShadow: `0 0 80px rgba(139,92,246,0.12)`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.cyan,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 20,
            }}
          >
            COMMAND CENTER
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Step into the
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.purple}, ${C.pink})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Command Center.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: C.text2,
              lineHeight: 1.7,
              marginBottom: 12,
              maxWidth: 520,
              margin: "0 auto 12px",
            }}
          >
            No fake data. Real GPS. Real AI. Real-time protection.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 40,
              marginTop: 20,
            }}
          >
            {[
              "Real GPS Tracking",
              "Gemini AI",
              "PostgreSQL Database",
              "Emergency Support",
            ].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.text2,
                }}
              >
                <CheckCircle size={12} color={C.cyan} /> {s}
              </div>
            ))}
          </div>
          <NeonButton href={cta} style={{ padding: "16px 40px", fontSize: 16 }}>
            {ctaLabel} <ArrowRight size={18} />
          </NeonButton>
        </GlassCard>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "48px max(24px, calc((100vw - 1200px)/2)) 32px",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 32,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: `linear-gradient(135deg,${C.purple},${C.pink})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={16} color="#fff" />
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: "-0.3px",
                  color: C.text1,
                }}
              >
                SHEild AI V4
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.8 }}>
              Real AI · Real GPS · Real Database
              <br />
              Real Emergency Support
            </div>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              {
                label: "App",
                links: [
                  { text: "Dashboard", href: "/dashboard" },
                  { text: "Safety Map", href: "/map" },
                  { text: "AI Assistant", href: "/ai-assistant" },
                ],
              },
              {
                label: "Account",
                links: [
                  { text: "Sign In", href: "/account/signin" },
                  { text: "Sign Up", href: "/account/signup" },
                  { text: "Profile", href: "/profile" },
                ],
              },
            ].map((col) => (
              <div key={col.label}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.text3,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  {col.label}
                </div>
                {col.links.map((l) => (
                  <a
                    key={l.text}
                    href={l.href}
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: C.text2,
                      textDecoration: "none",
                      marginBottom: 8,
                      transition: "color 0.2s",
                    }}
                  >
                    {l.text}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: C.text3 }}>
            © 2026 SHEild AI V4. Empowering women's safety worldwide.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: 12, color: C.text3, textDecoration: "none" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes landPulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes landIn { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0%}50%{background-position:100%}100%{background-position:0%} }
        @media(max-width:900px){
          .land-desktop{display:none!important}
          .land-mobile{display:flex!important}
          .land-feature-grid{grid-template-columns:repeat(2,1fr)!important}
          .land-stats-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:580px){
          .land-feature-grid{grid-template-columns:1fr!important}
          .land-stats-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        html{scroll-behavior:smooth}
      `}</style>
    </div>
  );
}
