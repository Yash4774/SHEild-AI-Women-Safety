import { useState, useEffect, useRef } from "react";
import {
  AlertOctagon,
  Mic,
  Phone,
  Shield,
  Zap,
  MessageCircle,
  ChevronRight,
  X,
  Volume2,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const EMERGENCY_MODES = [
  {
    id: "stalking",
    label: "Being Stalked",
    icon: "👁",
    color: "red",
    steps: [
      "Stay in well-lit, populated areas",
      "Enter a shop or public building immediately",
      "Call a trusted contact and stay on the line",
      "Note the stalker's description without confronting",
      "Alert local authorities with your location",
      "Use fake call feature to appear busy",
    ],
  },
  {
    id: "harassment",
    label: "Harassment",
    icon: "⚠️",
    color: "orange",
    steps: [
      "Stay calm and assertive — do not engage aggressively",
      "Move toward populated areas or businesses",
      "Record the incident if safe to do so",
      "Alert nearby people for help",
      "Report to authorities with full description",
      "Store evidence in your vault immediately",
    ],
  },
  {
    id: "lost",
    label: "I'm Lost",
    icon: "🗺",
    color: "blue",
    steps: [
      "Stay where you are — do not wander further",
      "Enable your location sharing with guardian",
      "Call your emergency contact",
      "Find a landmark or street sign",
      "Ask a nearby shop or person for directions",
      "Share your live location via this app",
    ],
  },
  {
    id: "medical",
    label: "Medical Emergency",
    icon: "🏥",
    color: "pink",
    steps: [
      "Call emergency services (911) immediately",
      "Describe your exact location and symptoms",
      "Stay on the line with the operator",
      "If safe, alert nearby people to help",
      "Do not move if you suspect spinal injury",
      "Unlock your phone for first responders",
    ],
  },
];

const COLOR_MAP = {
  red: "border-red-500/30 bg-red-500/10 text-red-400",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
};

export default function SOSPage() {
  const { data: user } = useUser();
  const [sosActive, setSosActive] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(
    "Click to start voice monitoring",
  );
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [callerName, setCallerName] = useState("Mom");
  const [callDelay, setCallDelay] = useState(5);
  const [callTimer, setCallTimer] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm your AI Emergency Copilot. Select an emergency mode above or describe your situation — I'll guide you step by step.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const triggerSOS = async () => {
    setSosActive(true);
    // Play alarm
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.4 + 0.35,
        );
        osc.start(ctx.currentTime + i * 0.4);
        osc.stop(ctx.currentTime + i * 0.4 + 0.35);
      }
    } catch (e) {}
    // Send to DB
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await fetch("/api/sos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location_lat: pos.coords.latitude,
              location_lng: pos.coords.longitude,
              message: "EMERGENCY SOS - triggered from Emergency Hub",
            }),
          });
        } catch (err) {
          console.error(err);
        }
      });
    }
    setTimeout(() => setSosActive(false), 8000);
  };

  const startVoiceMonitoring = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setVoiceActive(true);
      setVoiceStatus("Listening... Say 'Help Me', 'Emergency', or 'Save Me'");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .toLowerCase();
      if (
        transcript.includes("help me") ||
        transcript.includes("emergency") ||
        transcript.includes("save me") ||
        transcript.includes("help")
      ) {
        setVoiceStatus("🚨 TRIGGER WORD DETECTED! Activating SOS...");
        recognition.stop();
        setVoiceActive(false);
        triggerSOS();
      }
    };
    recognition.onerror = () => {
      setVoiceStatus("Voice error — try again");
      setVoiceActive(false);
    };
    recognition.onend = () => {
      if (voiceActive) setVoiceStatus("Voice monitoring stopped");
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceMonitoring = () => {
    recognitionRef.current?.stop();
    setVoiceActive(false);
    setVoiceStatus("Voice monitoring stopped");
  };

  const scheduleFakeCall = () => {
    if (callTimer) {
      clearTimeout(callTimer);
      setCallTimer(null);
      return;
    }
    const timer = setTimeout(() => {
      setFakeCallActive(true);
      setCallTimer(null);
    }, callDelay * 1000);
    setCallTimer(timer);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput };
    const modeContext = activeMode
      ? `The user is in a ${activeMode.label} emergency situation. `
      : "";
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/integrations/google-gemini-2-5-pro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are SHEild AI Emergency Copilot, an expert women's safety assistant. ${modeContext}Provide clear, calm, actionable emergency guidance. Be direct and brief. No disclaimers.`,
            },
            ...chatMessages,
            userMsg,
          ],
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content =
        data.choices?.[0]?.message?.content ||
        "I'm here to help. Please describe your situation.";
      setChatMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (err) {
      console.error(err);
      setError("AI assistant unavailable. Call emergency services directly.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppShell activePage="sos">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Emergency Hub</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI copilot for emergencies + voice SOS + fake call generator
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* BIG SOS Button */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900/30 to-red-600/10 border border-red-500/20 p-8 flex flex-col md:flex-row items-center gap-8">
          <button
            onClick={triggerSOS}
            className={`relative h-32 w-32 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${sosActive ? "bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.8)]" : "bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)]"}`}
            style={
              sosActive
                ? { animation: "sosRing 0.5s ease-in-out infinite" }
                : {}
            }
          >
            <div
              className="absolute inset-0 rounded-full border-4 border-red-400/30"
              style={{ animation: "sosPing 2s ease-in-out infinite" }}
            />
            <div
              className="absolute inset-2 rounded-full border-4 border-red-400/20"
              style={{ animation: "sosPing 2s 0.5s ease-in-out infinite" }}
            />
            <Shield size={48} className="text-white relative z-10" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              {sosActive
                ? "SOS SENT! Help is Coming!"
                : "One-Tap Emergency SOS"}
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              {sosActive
                ? "Your location has been sent to emergency contacts. Stay calm."
                : "Tap to instantly alert emergency contacts, share live location, and trigger alarm"}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                <Zap size={12} className="text-yellow-400" /> Live location
                shared
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                <Volume2 size={12} className="text-red-400" /> Alarm triggered
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                <MessageCircle size={12} className="text-violet-400" /> Contacts
                notified
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Emergency Mode Selector */}
          <div className="space-y-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <AlertOctagon size={16} className="text-red-400" /> AI Emergency
              Copilot
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {EMERGENCY_MODES.map((mode) => {
                const cls = COLOR_MAP[mode.color];
                const isActive = activeMode?.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(isActive ? null : mode)}
                    className={`p-4 rounded-2xl border transition-all text-left ${isActive ? cls : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <div className="text-sm font-bold text-white">
                      {mode.label}
                    </div>
                  </button>
                );
              })}
            </div>
            {activeMode && (
              <div
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
                style={{ animation: "sosIn 0.3s ease both" }}
              >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">{activeMode.icon}</span>{" "}
                  {activeMode.label} — Step by Step
                </h3>
                <div className="space-y-3">
                  {activeMode.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-black text-violet-400">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Voice SOS */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <Mic size={16} className="text-violet-400" /> Voice Activated
                SOS
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Say "Help Me", "Emergency", or "Save Me" to trigger SOS
                instantly
              </p>
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-medium ${voiceActive ? "bg-violet-500/10 border border-violet-500/20 text-violet-300" : "bg-white/5 border border-white/5 text-gray-400"}`}
              >
                {voiceActive && (
                  <span
                    className="inline-block mr-2"
                    style={{ animation: "sosRing 0.8s ease infinite" }}
                  >
                    🔴
                  </span>
                )}
                {voiceStatus}
              </div>
              <button
                onClick={
                  voiceActive ? stopVoiceMonitoring : startVoiceMonitoring
                }
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${voiceActive ? "bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30" : "bg-violet-600 hover:bg-violet-700 text-white"}`}
              >
                {voiceActive
                  ? "Stop Voice Monitoring"
                  : "Start Voice Monitoring"}
              </button>
            </div>

            {/* Fake Call */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <Phone size={16} className="text-pink-400" /> Fake Call
                Generator
              </h2>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                    Caller Name
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                    Ring after {callDelay}s
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={callDelay}
                    onChange={(e) => setCallDelay(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
              <button
                onClick={scheduleFakeCall}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${callTimer ? "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30" : "bg-pink-600 hover:bg-pink-700 text-white"}`}
              >
                {callTimer ? `Calling in... (cancel)` : "Schedule Fake Call"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-indigo-400" /> AI Emergency
            Assistant
          </h2>
          <div
            className="h-52 overflow-y-auto space-y-3 mb-4 pr-1"
            style={{ scrollbarWidth: "none" }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/5 border border-white/5 text-gray-200"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 text-gray-500 text-sm italic">
                  AI thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Describe your situation for AI guidance..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder-gray-600"
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Fake Call Overlay */}
      {fakeCallActive && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
          style={{ animation: "sosIn 0.3s ease both" }}
        >
          <div className="text-center">
            <div
              className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-8 flex items-center justify-center text-5xl shadow-2xl shadow-emerald-500/30"
              style={{ animation: "sosPing 1.5s ease-in-out infinite" }}
            >
              📞
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {callerName}
            </div>
            <div className="text-gray-400 mb-12">Incoming Call...</div>
            <div className="flex gap-16">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setFakeCallActive(false)}
                  className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl hover:bg-red-700 active:scale-95 transition-all"
                >
                  <Phone size={32} className="rotate-[135deg]" />
                </button>
                <span className="text-sm text-gray-400">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setFakeCallActive(false)}
                  className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Phone size={32} />
                </button>
                <span className="text-sm text-gray-400">Answer</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sosPing { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.8} }
        @keyframes sosRing { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes sosIn { from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)} }
      `}</style>
    </AppShell>
  );
}
