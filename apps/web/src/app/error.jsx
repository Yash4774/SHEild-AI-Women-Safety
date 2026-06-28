"use client";
import { useEffect } from "react";
import { Shield, RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("SHEild AI Error:", error);
  }, [error]);

  const message = error?.message || "Something went wrong";
  const isChunkError = message.includes("chunk") || message.includes("Loading");
  const isAuthError =
    message.includes("auth") ||
    message.includes("session") ||
    message.includes("401");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <AlertTriangle size={30} color="#f87171" />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 12px",
            letterSpacing: "-0.5px",
          }}
        >
          {isChunkError
            ? "Loading Failed"
            : isAuthError
              ? "Authentication Error"
              : "Something Went Wrong"}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#a1a1aa",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          {isChunkError
            ? "A page resource failed to load. This usually fixes itself after a refresh."
            : isAuthError
              ? "Your session may have expired. Please sign in again."
              : "An unexpected error occurred. Don't worry — your data is safe."}
        </p>
        <div
          style={{
            margin: "0 0 28px",
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.15)",
            fontSize: 12,
            color: "#f87171",
            fontFamily: "monospace",
            wordBreak: "break-word",
          }}
        >
          {message.substring(0, 120)}
          {message.length > 120 ? "..." : ""}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reset}
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
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(124,58,237,0.3)",
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>
          {isAuthError ? (
            <a
              href="/account/signin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Sign In
            </a>
          ) : (
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Home size={15} /> Home
            </a>
          )}
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(124,58,237,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={14} color="#a78bfa" />
          </div>
          <span style={{ fontSize: 12, color: "#52525b" }}>
            SHEild AI — Your data is safe
          </span>
        </div>
      </div>
    </div>
  );
}
