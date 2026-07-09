"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map as GMap,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  Navigation,
  MapPin,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  Search,
  ArrowRight,
  Map,
  Car,
  Bike,
  Footprints,
  X,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/components/ThemeProvider";

const TRAVEL_MODES = [
  { id: "WALKING", label: "Walk", icon: Footprints },
  { id: "DRIVING", label: "Drive", icon: Car },
  { id: "BICYCLING", label: "Bike", icon: Bike },
];

function MapsProvider({ apiKey, children }) {
  if (!apiKey) return children;
  return (
    <APIProvider apiKey={apiKey} libraries={["places", "routes"]}>
      {children}
    </APIProvider>
  );
}

// Places autocomplete
function DestinationInput({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const svcRef = useRef(null);
  const placesLib = useMapsLibrary("places");
  const bord = "var(--border)";
  const surf = "var(--surface)";
  const t1 = "var(--text1)";

  useEffect(() => {
    if (placesLib && !svcRef.current) {
      svcRef.current = new placesLib.AutocompleteService();
    }
  }, [placesLib]);

  const query = useCallback((input) => {
    if (!svcRef.current || input.length < 2) {
      setSuggestions([]);
      return;
    }
    svcRef.current.getPlacePredictions(
      { input, types: ["geocode", "establishment"] },
      (preds, status) => {
        setSuggestions(status === "OK" && preds ? preds.slice(0, 5) : []);
        setOpen(true);
      },
    );
  }, []);

  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          query(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            onSelect(value.trim());
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: surf,
          border: `1px solid ${bord}`,
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12,
          color: t1,
          outline: "none",
        }}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "#0d0d18",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          {suggestions.map((p) => (
            <button
              key={p.place_id}
              onMouseDown={() => {
                onChange(p.description);
                onSelect(p.description);
                setSuggestions([]);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MapPin size={12} color="#7c3aed" style={{ flexShrink: 0 }} />
              <div>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7" }}
                >
                  {p.structured_formatting?.main_text || p.description}
                </div>
                <div style={{ fontSize: 10, color: "#71717a" }}>
                  {p.structured_formatting?.secondary_text || ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Google Directions renderer
function RouteRenderer({ origin, destination, travelMode, onResult }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const rendRef = useRef(null);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clean up previous renderer
    if (rendRef.current) {
      rendRef.current.setMap(null);
    }

    rendRef.current = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#FF4FD8",
        strokeWeight: 5,
        strokeOpacity: 0.9,
      },
    });

    const svc = new routesLib.DirectionsService();
    svc.route(
      {
        origin,
        destination,
        travelMode:
          routesLib.TravelMode[travelMode] || routesLib.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          rendRef.current.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg)
            onResult({
              distance: leg.distance?.text,
              duration: leg.duration?.text,
              endAddress: leg.end_address,
            });
        } else {
          onResult(null);
        }
      },
    );

    return () => {
      if (rendRef.current) {
        rendRef.current.setMap(null);
        rendRef.current = null;
      }
    };
  }, [routesLib, map, origin, destination, travelMode, onResult]);

  return null;
}

// ── Main ──────────────────────────────────────────────────────────
export default function SafeRoutePage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [destInput, setDestInput] = useState("");
  const [destConfirmed, setDestConfirmed] = useState("");
  const [travelMode, setTravelMode] = useState("WALKING");
  const [currentPos, setCurrentPos] = useState({ lat: 28.6139, lng: 77.209 });
  const [gpsStatus, setGpsStatus] = useState("acquiring");
  const [routeResult, setRouteResult] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const mapsApiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCurrentPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGpsStatus("connected");
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const findRoute = async () => {
    const dest = destConfirmed || destInput.trim();
    if (!dest) {
      setError("Please enter a destination.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    setRouteResult(null);
    setSafetyScore(null);

    const originStr = `${currentPos.lat},${currentPos.lng}`;
    setActiveRoute({ origin: originStr, destination: dest });

    try {
      const res = await fetch("/api/safety-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originStr,
          destination: dest,
          time: new Date().toLocaleTimeString(),
          current_reports: [],
        }),
      });
      if (res.ok) setSafetyScore(await res.json());
    } catch (e) {
      console.warn(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const clearRoute = () => {
    setActiveRoute(null);
    setRouteResult(null);
    setSafetyScore(null);
    setDestInput("");
    setDestConfirmed("");
    setError(null);
  };

  const scoreColor = !safetyScore
    ? "#7c3aed"
    : safetyScore.score >= 70
      ? "#10b981"
      : safetyScore.score >= 40
        ? "#f59e0b"
        : "#ef4444";

  const surf = "var(--surface)";
  const bord = "var(--border)";
  const t1 = "var(--text1)";
  const t2 = "var(--text2)";
  const bg2 = "var(--bg2)";

  const gpsColor =
    gpsStatus === "connected"
      ? "#10b981"
      : gpsStatus === "acquiring"
        ? "#f59e0b"
        : "#ef4444";

  return (
    <AppShell activePage="safe-route">
      <MapsProvider apiKey={mapsApiKey}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 58px)",
          }}
        >
          {/* Controls */}
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${bord}`,
              background: bg2,
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              zIndex: 20,
            }}
          >
            {/* GPS status */}
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: `${gpsColor}18`,
                border: `1px solid ${gpsColor}35`,
                fontSize: 10,
                fontWeight: 700,
                color: gpsColor,
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: gpsColor,
                  animation:
                    gpsStatus === "acquiring" ? "srPulse 1s infinite" : "none",
                }}
              />
              {gpsStatus === "connected"
                ? "GPS Active"
                : gpsStatus === "acquiring"
                  ? "Acquiring GPS…"
                  : "GPS Unavailable"}
            </div>

            {/* From */}
            <div
              style={{
                flex: "0 0 auto",
                padding: "8px 12px",
                borderRadius: 10,
                background: surf,
                border: `1px solid ${bord}`,
                fontSize: 12,
                color: t2,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <MapPin size={11} color="#10b981" /> Current Location
            </div>

            <ArrowRight size={14} color="#7c3aed" style={{ flexShrink: 0 }} />

            {/* Destination autocomplete */}
            <DestinationInput
              value={destInput}
              onChange={setDestInput}
              onSelect={setDestConfirmed}
              placeholder="Search destination (address, landmark, city…)"
            />

            {/* Travel modes */}
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              {TRAVEL_MODES.map((m) => {
                const Icon = m.icon;
                const active = travelMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTravelMode(m.id)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 9,
                      background: active
                        ? "rgba(124,58,237,0.2)"
                        : "transparent",
                      border: `1px solid ${active ? "rgba(124,58,237,0.4)" : bord}`,
                      color: active ? "#a78bfa" : t2,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: active ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                    title={m.label}
                  >
                    <Icon size={12} />
                    <span className="sr-ml">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <button
              onClick={findRoute}
              disabled={analyzing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 10,
                background: analyzing ? "rgba(124,58,237,0.45)" : "#7c3aed",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                cursor: analyzing ? "not-allowed" : "pointer",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {analyzing ? (
                <>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "srSpin 0.7s linear infinite",
                    }}
                  />{" "}
                  Finding…
                </>
              ) : (
                <>
                  <Zap size={13} /> Find Safe Route
                </>
              )}
            </button>
            {activeRoute && (
              <button
                onClick={clearRoute}
                style={{
                  padding: "9px 10px",
                  borderRadius: 10,
                  background: "transparent",
                  border: `1px solid ${bord}`,
                  color: t2,
                  cursor: "pointer",
                }}
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {error && (
            <div
              style={{
                margin: "6px 18px 0",
                padding: "8px 12px",
                borderRadius: 9,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.24)",
                color: "#f87171",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          {/* Map area */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, position: "relative", minHeight: 360 }}>
              {mapsApiKey ? (
                <GMap
                style={{ width: "100%", height: "100%" }}
                defaultCenter={currentPos}
                defaultZoom={13}
                gestureHandling="greedy"
                mapTypeControl={false}
                streetViewControl={false}
                colorScheme="DARK"
              >
                <Marker position={currentPos} title="Your Location" />
                {activeRoute && (
                  <RouteRenderer
                    origin={activeRoute.origin}
                    destination={activeRoute.destination}
                    travelMode={travelMode}
                    onResult={setRouteResult}
                  />
                )}
                </GMap>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    padding: 24,
                    boxSizing: "border-box",
                    background:
                      "radial-gradient(circle at center, rgba(124,58,237,.16), transparent 55%), var(--bg2)",
                  }}
                >
                  <div style={{ maxWidth: 440, textAlign: "center" }}>
                    <Map size={42} color="#a78bfa" style={{ margin: "0 auto 12px" }} />
                    <div style={{ color: t1, fontWeight: 800, fontSize: 18 }}>
                      Route planning is ready
                    </div>
                    <p style={{ color: t2, fontSize: 13, lineHeight: 1.6 }}>
                      Enter any destination to get a safety score. Add
                      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in Vercel to enable the
                      interactive map and turn-by-turn route preview.
                    </p>
                    {activeRoute && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activeRoute.origin)}&destination=${encodeURIComponent(activeRoute.destination)}&travelmode=${travelMode.toLowerCase()}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "10px 16px",
                          borderRadius: 10,
                          background: "#7c3aed",
                          color: "#fff",
                          textDecoration: "none",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Navigation size={14} /> Open directions
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!activeRoute && !analyzing && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "10px 20px",
                    borderRadius: 12,
                    background: "rgba(8,8,15,0.9)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    fontSize: 12,
                    color: t2,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Search size={12} color="#7c3aed" /> Search a destination
                  above to find the safest route
                </div>
              )}
            </div>

            {/* Side panel */}
            {(safetyScore || routeResult) && (
              <div
                style={{
                  width: 290,
                  borderLeft: `1px solid ${bord}`,
                  background: bg2,
                  overflowY: "auto",
                  flexShrink: 0,
                  padding: 16,
                  scrollbarWidth: "none",
                }}
              >
                {safetyScore && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: `linear-gradient(135deg,${scoreColor}1a,${scoreColor}08)`,
                      border: `1px solid ${scoreColor}35`,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: t2,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                      }}
                    >
                      AI Safety Score
                    </div>
                    <div
                      style={{
                        fontSize: 42,
                        fontWeight: 900,
                        color: scoreColor,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {safetyScore.score}
                      <span style={{ fontSize: 18, color: t2 }}>/100</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: surf,
                        borderRadius: 4,
                        overflow: "hidden",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${safetyScore.score}%`,
                          background: scoreColor,
                          borderRadius: 4,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: scoreColor,
                      }}
                    >
                      {safetyScore.risk_level || "Moderate"} Risk
                    </div>
                  </div>
                )}

                {routeResult && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      {
                        label: "Distance",
                        val: routeResult.distance || "–",
                        Icon: Navigation,
                      },
                      {
                        label: "Travel Time",
                        val: routeResult.duration || "–",
                        Icon: Clock,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 11,
                          background: surf,
                          border: `1px solid ${bord}`,
                          textAlign: "center",
                        }}
                      >
                        <s.Icon
                          size={14}
                          color="#7c3aed"
                          style={{ margin: "0 auto 4px" }}
                        />
                        <div
                          style={{ fontSize: 13, fontWeight: 800, color: t1 }}
                        >
                          {s.val}
                        </div>
                        <div style={{ fontSize: 10, color: t2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {routeResult?.endAddress && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 11,
                      background: "rgba(124,58,237,0.07)",
                      border: "1px solid rgba(124,58,237,0.18)",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#a78bfa",
                        marginBottom: 4,
                      }}
                    >
                      📍 Destination
                    </div>
                    <div style={{ fontSize: 11, color: t2, lineHeight: 1.4 }}>
                      {routeResult.endAddress}
                    </div>
                  </div>
                )}

                {safetyScore?.recommendations?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: t2,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 8,
                      }}
                    >
                      🛡 AI Safety Tips
                    </div>
                    {safetyScore.recommendations.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 7,
                          padding: "8px 10px",
                          borderRadius: 9,
                          background: surf,
                          border: `1px solid ${bord}`,
                        }}
                      >
                        <CheckCircle
                          size={11}
                          color="#10b981"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span
                          style={{ fontSize: 11, color: t2, lineHeight: 1.4 }}
                        >
                          {r}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 10,
                    color: "#52525b",
                    padding: "8px 0",
                    borderTop: `1px solid ${bord}`,
                    marginTop: 4,
                  }}
                >
                  Route via Google Maps Directions API. Safety score from Gemini
                  AI analysis.
                </div>
              </div>
            )}
          </div>
        </div>
      </MapsProvider>
      <style>{`
        @keyframes srPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes srSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:640px){.sr-ml{display:none}}
      `}</style>
    </AppShell>
  );
}
