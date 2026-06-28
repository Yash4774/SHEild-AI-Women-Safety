import { useState, useEffect } from "react";
import { Shield, Menu, X, Sun, Moon, Zap, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Dashboard", href: "/dashboard", icon: "⚡" },
  { label: "Safety Map", href: "/map", icon: "🗺" },
  { label: "Safe Route", href: "/safe-route", icon: "🛣" },
  { label: "Guardian", href: "/guardian", icon: "👥" },
  { label: "AI Assistant", href: "/ai-assistant", icon: "🤖" },
  { label: "Community", href: "/feed", icon: "💬" },
];

const MORE_LINKS = [
  { label: "Emergency Hub", href: "/sos", icon: "🆘" },
  { label: "Evidence Vault", href: "/vault", icon: "🔐" },
  { label: "Analytics", href: "/analytics", icon: "📊" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Safety DNA", href: "/profile", icon: "🧬" },
];

export function Navigation({
  user,
  dark,
  scrolled,
  menuOpen,
  setMenuOpen,
  toggleTheme,
  bg2,
  surf,
  bord,
  t1,
  t2,
  cta,
  ctaLabel,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") setActivePath(window.location.pathname);
  }, []);

  const isActive = (href) =>
    href === "/" ? activePath === "/" : activePath.startsWith(href);

  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest(".nav-more-wrap")) setMoreOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const glassBase = dark ? "rgba(5,5,12,0.85)" : "rgba(240,241,248,0.88)";
  const glassBorder = scrolled
    ? dark
      ? "rgba(124,58,237,0.38)"
      : "rgba(124,58,237,0.18)"
    : "transparent";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: scrolled ? 62 : 72,
          background: scrolled ? glassBase : "transparent",
          backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
          borderBottom: `1px solid ${glassBorder}`,
          boxShadow: scrolled
            ? dark
              ? "0 1px 0 rgba(124,58,237,0.18), 0 8px 40px rgba(0,0,0,0.45)"
              : "0 1px 0 rgba(124,58,237,0.08), 0 8px 32px rgba(0,0,0,0.08)"
            : "none",
          transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
          overflow: "visible",
        }}
      >
        {/* Neon accent top-bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: scrolled
              ? "linear-gradient(90deg,transparent 0%,rgba(124,58,237,0.85) 25%,rgba(219,39,119,0.85) 75%,transparent 100%)"
              : "transparent",
            transition: "opacity 0.35s",
            opacity: scrolled ? 1 : 0,
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* ── LEFT: Logo ── */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              flexShrink: 0,
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
                boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
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

          {/* ── CENTER: Nav Links (desktop) ── */}
          <div
            className="landing-desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#a78bfa" : t2,
                    textDecoration: "none",
                    transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
                    background: active
                      ? dark
                        ? "rgba(124,58,237,0.14)"
                        : "rgba(124,58,237,0.09)"
                      : "transparent",
                    border: `1px solid ${active ? "rgba(124,58,237,0.25)" : "transparent"}`,
                    boxShadow: active
                      ? "0 0 12px rgba(124,58,237,0.15)"
                      : "none",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = t1;
                      e.currentTarget.style.background = dark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = t2;
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {l.label}
                </a>
              );
            })}

            {/* More dropdown */}
            <div style={{ position: "relative" }} className="nav-more-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreOpen(!moreOpen);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 11px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  color: moreOpen ? t1 : t2,
                  background: moreOpen
                    ? dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)"
                    : "transparent",
                  border: `1px solid ${moreOpen ? bord : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!moreOpen) {
                    e.currentTarget.style.color = t1;
                    e.currentTarget.style.background = dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!moreOpen) {
                    e.currentTarget.style.color = t2;
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                More{" "}
                <ChevronDown
                  size={12}
                  style={{
                    transition: "transform 0.22s",
                    transform: moreOpen ? "rotate(180deg)" : "none",
                  }}
                />
              </button>

              {moreOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    minWidth: 190,
                    background: dark
                      ? "rgba(6,6,16,0.97)"
                      : "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: `1px solid ${dark ? "rgba(124,58,237,0.25)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 14,
                    padding: 5,
                    boxShadow: dark
                      ? "0 24px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)"
                      : "0 12px 40px rgba(0,0,0,0.14)",
                    animation: "navDrop 0.18s cubic-bezier(0.4,0,0.2,1) both",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: 1,
                      background:
                        "linear-gradient(90deg,transparent,rgba(124,58,237,0.6),transparent)",
                      borderRadius: 1,
                    }}
                  />
                  {MORE_LINKS.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <a
                        key={l.href}
                        href={l.href}
                        onClick={() => setMoreOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderRadius: 9,
                          fontSize: 13,
                          fontWeight: active ? 700 : 500,
                          color: active ? "#a78bfa" : t1,
                          textDecoration: "none",
                          background: active
                            ? "rgba(124,58,237,0.1)"
                            : "transparent",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!active)
                            e.currentTarget.style.background = dark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            width: 22,
                            textAlign: "center",
                          }}
                        >
                          {l.icon}
                        </span>
                        {l.label}
                        {active && (
                          <div
                            style={{
                              marginLeft: "auto",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#7c3aed",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Controls (desktop) ── */}
          <div
            className="landing-desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: dark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                border: `1px solid ${bord}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t2,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.07)";
                e.currentTarget.style.color = t1;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = dark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)";
                e.currentTarget.style.color = t2;
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div style={{ width: 1, height: 20, background: bord }} />

            {user ? (
              <>
                {/* Profile pill */}
                <a
                  href="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 10px 5px 5px",
                    borderRadius: 10,
                    background: dark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.03)",
                    border: `1px solid ${bord}`,
                    textDecoration: "none",
                    transition: "all 0.18s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.32)";
                    e.currentTarget.style.background = dark
                      ? "rgba(124,58,237,0.07)"
                      : "rgba(124,58,237,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = bord;
                    e.currentTarget.style.background = dark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.03)";
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c3aed,#db2777)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(user.name || "User").split(" ")[0]}
                  </span>
                </a>
                {/* Launch CTA */}
                <a
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: "none",
                    boxShadow:
                      "0 0 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.2px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 36px rgba(124,58,237,0.65), inset 0 1px 0 rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Zap size={14} /> Launch Safety Console
                </a>
              </>
            ) : (
              <>
                <a
                  href="/account/signin"
                  style={{
                    padding: "7px 14px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    color: t1,
                    textDecoration: "none",
                    border: `1px solid ${bord}`,
                    background: "transparent",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.32)";
                    e.currentTarget.style.background = dark
                      ? "rgba(124,58,237,0.07)"
                      : "rgba(124,58,237,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = bord;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Log In
                </a>
                <a
                  href="/account/signup"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: "none",
                    boxShadow:
                      "0 0 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.2px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 36px rgba(124,58,237,0.65), inset 0 1px 0 rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Zap size={14} /> Get Started Free
                </a>
              </>
            )}
          </div>

          {/* ── MOBILE: theme + hamburger ── */}
          <div
            className="landing-mobile-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              onClick={toggleTheme}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: dark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                border: `1px solid ${bord}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t2,
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: menuOpen
                  ? dark
                    ? "rgba(124,58,237,0.12)"
                    : "rgba(124,58,237,0.07)"
                  : dark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                border: `1px solid ${menuOpen ? "rgba(124,58,237,0.35)" : bord}`,
                borderRadius: 9,
                color: t1,
                cursor: "pointer",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div
            style={{
              background: dark ? "rgba(5,5,14,0.98)" : "rgba(240,241,248,0.98)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderTop: `1px solid ${dark ? "rgba(124,58,237,0.22)" : bord}`,
              padding: "10px 20px 24px",
              animation: "navDrop 0.22s cubic-bezier(0.4,0,0.2,1) both",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {/* Brand badge */}
            <div
              style={{
                padding: "4px 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                color: t2,
                borderBottom: `1px solid ${bord}`,
                marginBottom: 4,
              }}
            >
              <Shield size={11} color="#7c3aed" />
              SHEild AI — Women's Safety Platform
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                ● ACTIVE
              </span>
            </div>

            {[...NAV_LINKS, ...MORE_LINKS].map((l) => {
              const active = isActive(l.href);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 8px",
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#a78bfa" : t1,
                    textDecoration: "none",
                    borderBottom: `1px solid ${bord}`,
                    background: active
                      ? "rgba(124,58,237,0.07)"
                      : "transparent",
                    borderRadius: active ? 9 : 0,
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 19,
                      width: 26,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {l.icon}
                  </span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {active && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        flexShrink: 0,
                        boxShadow: "0 0 6px rgba(124,58,237,0.6)",
                      }}
                    />
                  )}
                </a>
              );
            })}

            <div style={{ paddingTop: 14, display: "flex", gap: 8 }}>
              {!user && (
                <a
                  href="/account/signin"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: 12,
                    border: `1px solid ${bord}`,
                    fontSize: 14,
                    fontWeight: 600,
                    color: t1,
                    textDecoration: "none",
                  }}
                >
                  Log In
                </a>
              )}
              <a
                href={cta}
                style={{
                  flex: user ? "1 1 100%" : 1,
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow:
                    "0 0 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  letterSpacing: "-0.2px",
                }}
              >
                <Zap size={15} /> {ctaLabel}
              </a>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes navDrop {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
