import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Upload,
  Image,
  Mic,
  Video,
  Trash2,
  Download,
  X,
  Clock,
  Shield,
  MapPin,
  RefreshCw,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUpload from "@/utils/useUpload";

export default function VaultPage() {
  const [upload, { loading: uploading }] = useUpload();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [gpsPos, setGpsPos] = useState(null);
  const [cityName, setCityName] = useState("");
  const fileInputRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetchVault();
    // Grab GPS for metadata tagging
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setGpsPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=12&accept-language=en`,
            );
            if (res.ok) {
              const d = await res.json();
              const city =
                d.address?.city || d.address?.town || d.address?.suburb || "";
              const state = d.address?.state || "";
              setCityName([city, state].filter(Boolean).join(", "));
            }
          } catch {}
        },
        () => {},
      );
    }
  }, []);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/evidence");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setEvidence(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load vault. Please sign in and try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveToDb = async ({ url, type, description }) => {
    const locationName =
      cityName ||
      (gpsPos
        ? `${gpsPos.lat.toFixed(4)}, ${gpsPos.lng.toFixed(4)}`
        : "Unknown location");
    const res = await fetch("/api/evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: url,
        file_type: type,
        description,
        location_name: locationName,
      }),
    });
    if (!res.ok) throw new Error(`DB save failed HTTP ${res.status}`);
    return res.json();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be picked again
    setError(null);
    setUploadProgress("Uploading to secure storage…");
    try {
      // ✅ Pass the File object directly — NEVER use blob/object URLs
      const { url, mimeType, error: uploadErr } = await upload({ file });
      if (uploadErr) throw new Error(uploadErr);
      if (!url)
        throw new Error("Upload returned no URL. File may exceed 4.5MB limit.");

      setUploadProgress("Saving to vault with GPS timestamp…");
      const type = mimeType?.startsWith("image")
        ? "image"
        : mimeType?.startsWith("audio")
          ? "audio"
          : mimeType?.startsWith("video")
            ? "video"
            : "other";

      const newItem = await saveToDb({ url, type, description: file.name });
      setEvidence((prev) => [newItem, ...prev]);
      setSuccess(`✓ ${file.name} secured in vault`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed: " + err.message);
    } finally {
      setUploadProgress(null);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick supported mimeType
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg;codecs=opus";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("ogg") ? "ogg" : "webm";
        // ✅ Wrap in File so useUpload sends via FormData
        const file = new File([blob], `recording-${Date.now()}.${ext}`, {
          type: mimeType,
        });
        setUploadProgress("Securing audio evidence…");
        try {
          const { url, error: uploadErr } = await upload({ file });
          if (uploadErr || !url)
            throw new Error(uploadErr || "Upload returned no URL");
          const timestamp = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          });
          const newItem = await saveToDb({
            url,
            type: "audio",
            description: `Audio recording — ${timestamp}`,
          });
          setEvidence((prev) => [newItem, ...prev]);
          setSuccess("✓ Audio evidence secured in vault");
          setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
          console.error("Audio upload error:", err);
          setError("Failed to save audio: " + err.message);
        } finally {
          setUploadProgress(null);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      setError(
        "Microphone access denied. Please allow mic permission in browser settings.",
      );
    }
  };

  const stopAudioRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
    setMediaRecorder(null);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.description}"? This cannot be undone.`))
      return;
    try {
      const res = await fetch("/api/evidence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvidence((prev) => prev.filter((e) => e.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      setSuccess("Evidence deleted.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const getIcon = (type) => {
    if (type === "image") return <Image size={20} className="text-cyan-400" />;
    if (type === "audio") return <Mic size={20} className="text-violet-400" />;
    if (type === "video") return <Video size={20} className="text-pink-400" />;
    return <Lock size={20} className="text-gray-400" />;
  };

  const counts = {
    image: evidence.filter((e) => e.file_type === "image").length,
    audio: evidence.filter((e) => e.file_type === "audio").length,
    video: evidence.filter((e) => e.file_type === "video").length,
  };

  return (
    <AppShell activePage="vault">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Evidence Vault</h1>
            <p className="text-gray-400 text-sm mt-1">
              GPS-timestamped, encrypted evidence — legally admissible records
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {gpsPos && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <MapPin size={10} />{" "}
                {cityName ||
                  `${gpsPos.lat.toFixed(3)}, ${gpsPos.lng.toFixed(3)}`}
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <Shield size={12} /> {evidence.length} items secured
            </div>
            <button
              onClick={fetchVault}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}
        {uploadProgress && (
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent flex-shrink-0"
              style={{ animation: "vaultSpin 0.8s linear infinite" }}
            />
            {uploadProgress}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              t: "Images",
              v: counts.image,
              icon: Image,
              c: "text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
            },
            {
              t: "Audio",
              v: counts.audio,
              icon: Mic,
              c: "text-violet-400",
              bg: "bg-violet-500/10 border-violet-500/20",
            },
            {
              t: "Videos",
              v: counts.video,
              icon: Video,
              c: "text-pink-400",
              bg: "bg-pink-500/10 border-pink-500/20",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.t}
                className={`p-4 rounded-2xl border text-center ${s.bg}`}
              >
                <Icon size={18} className={`${s.c} mx-auto mb-2`} />
                <div className="text-xl font-black text-white">{s.v}</div>
                <div className="text-[10px] text-gray-500">{s.t}</div>
              </div>
            );
          })}
        </div>

        {/* Upload controls */}
        <div className="grid sm:grid-cols-3 gap-4">
          <label
            className={`group cursor-pointer p-5 rounded-2xl border transition-all text-center ${uploading || uploadProgress ? "opacity-60 cursor-not-allowed bg-white/[0.01] border-white/5" : "bg-white/[0.02] border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || !!uploadProgress}
            />
            <Upload size={24} className="text-cyan-400 mx-auto mb-3" />
            <div className="text-sm font-bold text-white mb-1">
              Upload Photo / Video
            </div>
            <div className="text-xs text-gray-500">
              {uploading ? "Uploading…" : "Click to select file (max 4.5MB)"}
            </div>
          </label>

          <button
            onClick={recording ? stopAudioRecording : startAudioRecording}
            disabled={!!uploadProgress && !recording}
            className={`group p-5 rounded-2xl border transition-all text-center ${recording ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.02] border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5"}`}
          >
            <Mic
              size={24}
              className={`mx-auto mb-3 ${recording ? "text-red-400" : "text-violet-400"}`}
              style={
                recording ? { animation: "vaultRec 1s ease infinite" } : {}
              }
            />
            <div className="text-sm font-bold text-white mb-1">
              {recording ? "🔴 Recording…" : "Record Audio"}
            </div>
            <div className="text-xs text-gray-500">
              {recording ? "Tap to stop & save" : "Hands-free evidence capture"}
            </div>
          </button>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-center">
            <Lock size={24} className="text-emerald-400 mx-auto mb-3" />
            <div className="text-sm font-bold text-white mb-1">
              {gpsPos ? "GPS Tagged" : "End-to-End Encrypted"}
            </div>
            <div className="text-xs text-gray-500">
              {gpsPos
                ? `📍 Location saved with each file`
                : "Enable location for GPS metadata"}
            </div>
          </div>
        </div>

        {/* Evidence grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/[0.02] border border-white/5 shimmer"
              />
            ))}
          </div>
        ) : evidence.length === 0 ? (
          <div className="text-center py-20">
            <Lock size={56} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2 text-xl">
              Vault is Empty
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Upload photos, videos or record audio to store GPS-timestamped
              evidence securely.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {evidence.map((item, i) => (
              <div
                key={item.id || i}
                className="group relative aspect-square rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer hover:border-white/20 transition-all"
                style={{ animation: `vaultIn 0.4s ${i * 0.04}s ease both` }}
              >
                <div
                  onClick={() => setSelected(item)}
                  className="absolute inset-0"
                >
                  {item.file_type === "image" ? (
                    <img
                      src={item.file_url}
                      alt="Evidence"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
                      {getIcon(item.file_type)}
                      <span className="text-[10px] text-gray-500 capitalize">
                        {item.file_type}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <div className="p-1 rounded-lg bg-white/10">
                      {getIcon(item.file_type)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all"
                    >
                      <Trash2 size={11} color="#f87171" />
                    </button>
                  </div>
                  <div onClick={() => setSelected(item)}>
                    <div className="flex items-center gap-1 text-[9px] text-white font-medium">
                      <Clock size={8} />
                      {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </div>
                    {item.location_name && (
                      <div className="text-[9px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                        <MapPin size={7} /> {item.location_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview modal */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-[#0a0a12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {getIcon(selected.file_type)}
                  <div>
                    <div className="font-bold text-sm text-white">
                      {selected.description}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-3 mt-1">
                      <span>
                        <Clock size={8} className="inline mr-1" />
                        {new Date(selected.created_at).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}{" "}
                        IST
                      </span>
                      {selected.location_name && (
                        <span>
                          <MapPin size={8} className="inline mr-1" />
                          {selected.location_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(selected)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                {selected.file_type === "image" && (
                  <img
                    src={selected.file_url}
                    alt="Evidence"
                    className="w-full rounded-xl max-h-96 object-contain"
                  />
                )}
                {selected.file_type === "audio" && (
                  <audio controls src={selected.file_url} className="w-full" />
                )}
                {selected.file_type === "video" && (
                  <video
                    controls
                    src={selected.file_url}
                    className="w-full rounded-xl max-h-96"
                  />
                )}
              </div>
              <div className="p-5 border-t border-white/5">
                <a
                  href={selected.file_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 justify-center w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
                >
                  <Download size={16} /> Download Evidence
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes vaultIn { from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)} }
        @keyframes vaultRec { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes vaultSpin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.02) 25%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.02) 75%); background-size:200% 100%; animation:shimmerVault 1.5s infinite; }
        @keyframes shimmerVault { 0%{background-position:-200% 0}100%{background-position:200% 0} }
      `}</style>
    </AppShell>
  );
}
