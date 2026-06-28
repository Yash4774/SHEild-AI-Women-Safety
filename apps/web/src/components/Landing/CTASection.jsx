import { Zap, ArrowRight } from "lucide-react";

export function CTASection({ dark, t1, t2, cta, ctaLabel }) {
  return (
    <section style={{ padding: "0 24px 64px" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          borderRadius: 32,
          background:
            "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(219,39,119,0.12))",
          border: "1px solid rgba(124,58,237,0.22)",
          padding: "60px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%,rgba(124,58,237,0.08),transparent 65%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: t1,
              margin: "0 0 14px",
            }}
          >
            Your Shield Awaits.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: t2,
              maxWidth: 440,
              margin: "0 auto 28px",
            }}
          >
            Join thousands of women protected by SHEild AI every day.
          </p>
          <a
            href={cta}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "15px 34px",
              borderRadius: 16,
              background: dark ? "#ffffff" : "#0f0f1a",
              color: dark ? "#050508" : "#ffffff",
              fontWeight: 900,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              letterSpacing: "-0.3px",
            }}
          >
            <Zap size={17} color="#7c3aed" /> {ctaLabel}{" "}
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
