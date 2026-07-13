"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  Bell,
  Calendar,
  MapPin,
  Search,
  Navigation,
} from "lucide-react";
import { APIProvider } from "@vis.gl/react-google-maps";
import AppShell from "@/components/AppShell";

// ── Google Places Autocomplete Input ──────────────────────────────
// Uses window.google loaded by APIProvider
function PlacesInput({ value, onChange, onPlaceSelect, disabled, mapsAvailable }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputVal, setInputVal] = useState(value || "");
  const [validated, setValidated] = useState(false);
  const svcRef = useRef(null);

  // Initialise AutocompleteService once Google Maps is ready
  useEffect(() => {
    let tries = 0;
    const init = () => {
      if (!mapsAvailable) return;
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        svcRef.current = new window.google.maps.places.AutocompleteService();
      } else if (tries < 30) {
        tries++;
        setTimeout(init, 300);
      }
    };
    init();
  }, [mapsAvailable]);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2 || !svcRef.current) {
      setSuggestions([]);
      return;
    }
    try {
      svcRef.current.getPlacePredictions(
        { input: query, types: ["geocode", "establishment"] },
        (predictions, status) => {
          if (status === "OK" && predictions)
            setSuggestions(predictions.slice(0, 5));
          else setSuggestions([]);
        },
      );
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setInputVal(v);
    setValidated(false);
    onChange(v);
    fetchSuggestions(v);
    setShowSuggestions(true);
  };

  const selectSuggestion = useCallback(
    (prediction) => {
      // Geocode place to get coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          const placeData = {
            name: prediction.description,
            address: results[0].formatted_address,
            lat: loc.lat(),
            lng: loc.lng(),
          };
          setInputVal(prediction.description);
          onChange(prediction.description);
          setSuggestions([]);
          setShowSuggestions(false);
          setValidated(true);
          onPlaceSelect(placeData);
        }
      });
    },
    [onChange, onPlaceSelect],
  );

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: validated ? "#10b981" : "#6b7280",
            flexShrink: 0,
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInput}
          onFocus={() => inputVal.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
          placeholder={
            mapsAvailable
              ? "Search for a real location or address…"
              : "Enter destination or address"
          }
          className="w-full bg-white/5 border rounded-xl py-3 text-sm text-white outline-none placeholder-gray-600"
          style={{
            padding: "12px 14px 12px 38px",
            borderColor: validated
              ? "rgba(16,185,129,0.5)"
              : "rgba(255,255,255,0.1)",
          }}
          autoComplete="off"
        />
        {validated && (
          <CheckCircle
            size={14}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#10b981",
            }}
          />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#0a0a18",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onMouseDown={() => selectSuggestion(s)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                padding: "10px 12px",
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: 9,
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <MapPin
                size={13}
                style={{ color: "#a78bfa", marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                  {s.structured_formatting?.main_text || s.description}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
                  {s.structured_formatting?.secondary_text || ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {mapsAvailable && !validated && inputVal.length > 0 && !showSuggestions && (
        <div
          style={{
            fontSize: 10,
            color: "#f87171",
            marginTop: 5,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <AlertTriangle size={10} /> Please select a valid location from the
          suggestions.
        </div>
      )}
    </div>
  );
}

// ── Main Check-In Page ─────────────────────────────────────────────
function CheckInContent({ mapsAvailable = false }) {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    destination: "",
    scheduled_arrival: "",
    emergency_contact: "",
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setCheckIns(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ destination: "", scheduled_arrival: "", emergency_contact: "" });
    setSelectedPlace(null);
    setError(null);
  };

  const submitCheckIn = async () => {
    if (!form.destination || !form.scheduled_arrival) {
      setError("Please fill in all required fields.");
      return;
    }
    // Require a verified place only when Google Places is available.
    if (mapsAvailable && !selectedPlace) {
      setError(
        "Please select a valid location from the suggestions. Free-text destinations are not accepted.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: selectedPlace?.name || form.destination,
          scheduled_arrival: form.scheduled_arrival,
          emergency_contact: form.emergency_contact,
          dest_lat: selectedPlace?.lat || null,
          dest_lng: selectedPlace?.lng || null,
          dest_address: selectedPlace?.address || form.destination,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newCheckIn = await res.json();
      setCheckIns((prev) => [newCheckIn, ...prev]);
      resetForm();
      setShowForm(false);
      setSuccess(
        "✅ Check-in scheduled! You'll be reminded, and your contact alerted if you miss it.",
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Failed to schedule check-in: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmArrival = async (id) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "arrived" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCheckIns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "arrived" } : c)),
      );
      setSuccess(
        "✓ Arrival confirmed! Your contacts have been notified you're safe.",
      );
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Failed to confirm arrival: " + err.message);
    }
  };

  const STATUS_COLOR = {
    pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    arrived: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    missed: "bg-red-500/10 border-red-500/20 text-red-400",
  };
  const STATUS_ICON = {
    pending: Clock,
    arrived: CheckCircle,
    missed: AlertTriangle,
  };
  const now = new Date();

  return (
    <AppShell activePage="checkin">
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">
              Smart Check-In System
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Schedule arrivals — missed check-in auto-alerts emergency contacts
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all active:scale-95"
          >
            <Plus size={16} /> New Check-In
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={14} />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {/* How it works */}
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              How Smart Check-In Works
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                t: "Select Real Location",
                d: "Search and pick a verified place from Google Maps",
              },
              {
                n: "2",
                t: "Set Arrival Time",
                d: "We monitor your schedule in the background",
              },
              {
                n: "3",
                t: "Auto Alert",
                d: "If you miss check-in, emergency contacts are notified immediately",
              },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-400 flex-shrink-0">
                  {s.n}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{s.t}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-ins list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 shimmer"
              />
            ))}
          </div>
        ) : checkIns.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={56} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2 text-xl">
              No Check-Ins Yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Schedule your first check-in to enable automatic safety
              monitoring.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 transition-all"
            >
              Schedule First Check-In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {checkIns.map((ci, i) => {
              const StatusIcon = STATUS_ICON[ci.status] || Clock;
              const clr = STATUS_COLOR[ci.status] || STATUS_COLOR.pending;
              const arrivalTime = new Date(ci.scheduled_arrival);
              const isPast = arrivalTime < now;
              return (
                <div
                  key={ci.id}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                  style={{ animation: `checkIn 0.4s ${i * 0.07}s ease both` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="font-bold text-white text-base">
                          {ci.destination}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 ${clr}`}
                        >
                          <StatusIcon size={10} />{" "}
                          {ci.status.charAt(0).toUpperCase() +
                            ci.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-amber-400" />
                          Arrival:{" "}
                          {arrivalTime.toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })}{" "}
                          IST
                        </div>
                        {ci.emergency_contact && (
                          <div className="flex items-center gap-1.5">
                            <Bell size={11} className="text-violet-400" />{" "}
                            {ci.emergency_contact}
                          </div>
                        )}
                        {ci.dest_lat && ci.dest_lng && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-cyan-400" />
                            {ci.dest_lat.toFixed(4)}, {ci.dest_lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                      {isPast && ci.status === "pending" && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-red-400 font-bold">
                          <AlertTriangle size={12} /> Arrival time passed —
                          guardian may be alerted!
                        </div>
                      )}
                    </div>
                    {ci.status === "pending" && (
                      <button
                        onClick={() => confirmArrival(ci.id)}
                        className="flex-shrink-0 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-2"
                      >
                        <CheckCircle size={14} /> I Arrived
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md bg-[#0a0a12] border border-white/10 rounded-3xl p-8 shadow-2xl"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">
                  Schedule Check-In
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Destination <span className="text-amber-400">*</span>
                  </label>
                  <PlacesInput
                    value={form.destination}
                    onChange={(v) => {
                      setForm((p) => ({ ...p, destination: v }));
                      if (!v) setSelectedPlace(null);
                    }}
                    onPlaceSelect={(place) => {
                      setSelectedPlace(place);
                      setForm((p) => ({ ...p, destination: place.name }));
                    }}
                    disabled={submitting}
                    mapsAvailable={mapsAvailable}
                  />
                  {!mapsAvailable && (
                    <div className="mt-2 text-[11px] text-amber-400">
                      Google Places is not configured, so free-text destinations are allowed.
                    </div>
                  )}
                  {selectedPlace && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-start gap-2">
                      <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold">{selectedPlace.name}</div>
                        <div className="text-emerald-500/70 mt-0.5">
                          {selectedPlace.address}
                        </div>
                        <div className="text-emerald-500/50 mt-0.5">
                          📍 {selectedPlace.lat.toFixed(5)},{" "}
                          {selectedPlace.lng.toFixed(5)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Expected Arrival Time (IST){" "}
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_arrival}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        scheduled_arrival: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Emergency Contact Email (optional)
                  </label>
                  <input
                    type="email"
                    value={form.emergency_contact}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        emergency_contact: e.target.value,
                      }))
                    }
                    placeholder="guardian@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 placeholder-gray-600"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">
                    This contact will be alerted if you miss your check-in
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCheckIn}
                    disabled={
                      submitting ||
                      !form.destination ||
                      !form.scheduled_arrival ||
                      (mapsAvailable && !selectedPlace)
                    }
                    className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? "Scheduling…" : "Schedule Check-In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes checkIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.02) 25%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.02) 75%); background-size:200% 100%; animation:checkShimmer 1.5s infinite; }
        @keyframes checkShimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
      `}</style>
    </AppShell>
  );
}

export default function CheckInPage() {
  const mapsApiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!mapsApiKey) {
    return <CheckInContent mapsAvailable={false} />;
  }

  return (
    <APIProvider
      apiKey={mapsApiKey}
      libraries={["places"]}
    >
      <CheckInContent mapsAvailable={true} />
    </APIProvider>
  );
}
