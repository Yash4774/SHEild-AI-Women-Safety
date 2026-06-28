import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  MessageSquare,
  Plus,
  Heart,
  MapPin,
  Filter,
  AlertTriangle,
  CheckCircle,
  X,
  Send,
  Users,
  Radio,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import useUser from "@/utils/auth/useUser";

const CATEGORIES = [
  "All",
  "Harassment",
  "Unsafe Area",
  "Suspicious",
  "Lighting",
  "Tip",
  "Safe",
];
const CAT_COLORS = {
  All: "#7c3aed",
  Harassment: "#ef4444",
  "Unsafe Area": "#f97316",
  Suspicious: "#f59e0b",
  Lighting: "#eab308",
  Tip: "#3b82f6",
  Safe: "#10b981",
};

// ── AI ASSISTANT PANEL (inline) ──────────────────────────────────
const AI_PROMPTS = [
  {
    label: "I'm being followed 👁",
    prompt: "Someone is following me right now. What do I do?",
  },
  {
    label: "Unsafe area 🗺",
    prompt: "I feel unsafe in this area. What steps should I take?",
  },
  {
    label: "Night travel 🌙",
    prompt: "I need to travel alone at night. How can I stay safe?",
  },
  {
    label: "Self defense 🥋",
    prompt: "Give me quick self-defense tips for women",
  },
  {
    label: "Emergency help 🆘",
    prompt: "What should I do in an emergency situation?",
  },
  {
    label: "Police nearby 🚔",
    prompt: "How do I find the nearest police station quickly?",
  },
];

const AI_SYSTEM =
  "You are SHEild AI — an expert women's safety advisor. Give direct, calm, actionable advice. Prioritize immediate physical safety. Keep responses concise (3-5 sentences max unless steps are needed). Always mention calling emergency services for life-threatening situations.";

function AIAssistantPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI safety copilot 🛡\n\nAsk me anything about:\n• Emergency situations\n• Safe routes & areas\n• Self-defense tips\n• Guardian setup\n• Night travel advice",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      100,
    );
    return () => clearTimeout(t);
  }, [messages]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/integrations/google-gemini-2-5-pro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: AI_SYSTEM },
            ...messages.slice(-6),
            userMsg,
          ],
          stream: false,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "I'm having trouble connecting. If this is an emergency, call 911 immediately.";
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("AI error:", e);
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "Connection error. For emergencies, please call 911 immediately.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      {/* AI Quick Prompts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 46, flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 7,
          gap: 8,
        }}
      >
        {AI_PROMPTS.map((p, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => send(p.prompt)}
            style={{
              backgroundColor: "rgba(124,58,237,0.15)",
              borderWidth: 1,
              borderColor: "rgba(124,58,237,0.28)",
              borderRadius: 20,
              paddingHorizontal: 13,
              paddingVertical: 6,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#a78bfa", fontWeight: "700", fontSize: 12 }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={{
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              marginBottom: 14,
              alignItems: "flex-end",
            }}
          >
            {msg.role === "assistant" && (
              <LinearGradient
                colors={["#7c3aed", "#4f46e5"]}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                  marginBottom: 2,
                  flexShrink: 0,
                }}
              >
                <Shield size={15} color="#fff" />
              </LinearGradient>
            )}
            <View
              style={{
                maxWidth: "80%",
                backgroundColor:
                  msg.role === "user" ? "#7c3aed" : "rgba(255,255,255,0.07)",
                borderWidth: 1,
                borderColor:
                  msg.role === "user" ? "#7c3aed" : "rgba(255,255,255,0.09)",
                borderRadius: 18,
                borderTopRightRadius: msg.role === "user" ? 4 : 18,
                borderBottomLeftRadius: msg.role === "assistant" ? 4 : 18,
                paddingHorizontal: 14,
                paddingVertical: 11,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, lineHeight: 21 }}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginBottom: 14,
            }}
          >
            <LinearGradient
              colors={["#7c3aed", "#4f46e5"]}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Shield size={15} color="#fff" />
            </LinearGradient>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.09)",
                borderRadius: 18,
                borderBottomLeftRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 13,
              }}
            >
              <View style={{ flexDirection: "row", gap: 5 }}>
                {[0, 1, 2].map((j) => (
                  <View
                    key={j}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: "#a78bfa",
                      opacity: 0.7,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Emergency warning */}
      <View
        style={{
          marginHorizontal: 14,
          marginBottom: 6,
          backgroundColor: "rgba(239,68,68,0.07)",
          borderWidth: 1,
          borderColor: "rgba(239,68,68,0.18)",
          borderRadius: 10,
          padding: 8,
        }}
      >
        <Text
          style={{
            color: "#f87171",
            fontSize: 11,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          ⚠ Life-threatening? Call 911 immediately — don't wait for AI
        </Text>
      </View>

      {/* Input bar */}
      <KeyboardAvoidingAnimatedView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
            backgroundColor: "rgba(8,8,20,0.95)",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about safety..."
            placeholderTextColor="#4b5563"
            multiline
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 11,
              color: "#fff",
              fontSize: 14,
              maxHeight: 90,
              marginRight: 10,
            }}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor:
                loading || !input.trim() ? "rgba(124,58,237,0.25)" : "#7c3aed",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}

// ── SAFETY FEED ──────────────────────────────────────────────────
function SafetyFeed() {
  const { data: user } = useUser();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    content: "",
    category: "Unsafe Area",
    location_name: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d)) setPosts(d);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const submitPost = async () => {
    if (!form.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: form.category.toLowerCase().replace(" ", "_"),
        }),
      });
      if (res.ok) {
        const np = await res.json();
        setPosts((p) => [np, ...p]);
        setShowForm(false);
        setForm({ content: "", category: "Unsafe Area", location_name: "" });
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const upvote = async (id) => {
    try {
      const res = await fetch("/api/feed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: id }),
      });
      if (res.ok) {
        const u = await res.json();
        setPosts((p) => p.map((x) => (x.id === id ? u : x)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered =
    filter === "All"
      ? posts
      : posts.filter((p) =>
          (p.category || "")
            .toLowerCase()
            .includes(filter.toLowerCase().replace(" ", "_")),
        );

  return (
    <View style={{ flex: 1 }}>
      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        }}
        style={{ maxHeight: 52, flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => {
          const active = filter === cat;
          const col = CAT_COLORS[cat] || "#7c3aed";
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilter(cat)}
              style={{
                backgroundColor: active ? col + "22" : "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: active ? col + "45" : "rgba(255,255,255,0.08)",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: active ? col : "#6b7280",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Report button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowForm(true);
        }}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          backgroundColor: "rgba(239,68,68,0.12)",
          borderWidth: 1,
          borderColor: "rgba(239,68,68,0.28)",
          borderRadius: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.8}
      >
        <Plus size={16} color="#f87171" style={{ marginRight: 8 }} />
        <Text style={{ color: "#f87171", fontWeight: "800", fontSize: 14 }}>
          Report Incident
        </Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            color="#7c3aed"
            style={{ marginTop: 40 }}
            size="large"
          />
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 50 }}>
            <Radio size={40} color="#374151" />
            <Text
              style={{
                color: "#6b7280",
                fontSize: 15,
                marginTop: 14,
                fontWeight: "600",
              }}
            >
              No reports yet
            </Text>
            <Text
              style={{
                color: "#4b5563",
                fontSize: 13,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Be the first to post a safety update
            </Text>
          </View>
        ) : (
          filtered.map((post, i) => {
            const col = CAT_COLORS[post.category] || "#f59e0b";
            return (
              <View
                key={post.id || i}
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <LinearGradient
                    colors={["#7c3aed", "#db2777"]}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}
                    >
                      {(post.author_name || "U")[0].toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}
                    >
                      {post.author_name || "Anonymous"}
                    </Text>
                    <Text
                      style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}
                    >
                      {new Date(post.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: col + "18",
                      borderRadius: 8,
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: col + "30",
                    }}
                  >
                    <Text
                      style={{
                        color: col,
                        fontWeight: "700",
                        fontSize: 10,
                        textTransform: "capitalize",
                      }}
                    >
                      {(post.category || "alert").replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: "#e5e7eb",
                    fontSize: 14,
                    lineHeight: 21,
                    marginBottom: 12,
                  }}
                >
                  {post.content}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => upvote(post.id)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={15}
                      color="#f87171"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: "#f87171",
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {post.upvotes || 0}
                    </Text>
                  </TouchableOpacity>
                  {post.location_name && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <MapPin
                        size={11}
                        color="#6b7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={{ color: "#6b7280", fontSize: 12 }}>
                        {post.location_name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Report form modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <KeyboardAvoidingAnimatedView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "#0B0B1A",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 24,
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.1)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}
                >
                  Report Incident
                </Text>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 10,
                }}
              >
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 16 }}
                style={{ maxHeight: 40, flexGrow: 0 }}
              >
                {[
                  "Harassment",
                  "Unsafe Area",
                  "Suspicious",
                  "Lighting",
                  "Tip",
                ].map((cat) => {
                  const active = form.category === cat;
                  const col = CAT_COLORS[cat] || "#7c3aed";
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setForm((p) => ({ ...p, category: cat }))}
                      style={{
                        backgroundColor: active
                          ? col + "22"
                          : "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: active
                          ? col + "45"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? col : "#9ca3af",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TextInput
                value={form.location_name}
                onChangeText={(t) =>
                  setForm((p) => ({ ...p, location_name: t }))
                }
                placeholder="Location (optional)"
                placeholderTextColor="#4b5563"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 13,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: "#fff",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              />
              <TextInput
                value={form.content}
                onChangeText={(t) => setForm((p) => ({ ...p, content: t }))}
                placeholder="Describe what you observed..."
                placeholderTextColor="#4b5563"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 13,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: "#fff",
                  fontSize: 14,
                  height: 100,
                  marginBottom: 16,
                }}
              />

              <TouchableOpacity
                onPress={submitPost}
                disabled={submitting || !form.content.trim()}
                style={{
                  backgroundColor: submitting
                    ? "rgba(239,68,68,0.4)"
                    : "#dc2626",
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                  >
                    Submit Report
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingAnimatedView>
      </Modal>
    </View>
  );
}

// ── MAIN COMMUNITY SCREEN ─────────────────────────────────────────
export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("feed");
  const tabAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === "feed" ? 0 : 1,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#07071A", "#04040E"]}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: -0.5,
              }}
            >
              Community
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
              Safety intelligence + AI copilot
            </Text>
          </View>
          <LinearGradient
            colors={["rgba(16,185,129,0.2)", "rgba(16,185,129,0.08)"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderWidth: 1,
              borderColor: "rgba(16,185,129,0.3)",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#10b981",
                marginRight: 7,
              }}
            />
            <Text style={{ color: "#10b981", fontWeight: "800", fontSize: 12 }}>
              LIVE
            </Text>
          </LinearGradient>
        </View>

        {/* Tab switcher */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 14,
            padding: 4,
            marginBottom: 16,
          }}
        >
          {["feed", "assistant"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => switchTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 11,
                backgroundColor: activeTab === tab ? "#7c3aed" : "transparent",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
              >
                {tab === "feed" ? (
                  <Radio
                    size={14}
                    color={activeTab === tab ? "#fff" : "#6b7280"}
                  />
                ) : (
                  <Shield
                    size={14}
                    color={activeTab === tab ? "#fff" : "#6b7280"}
                  />
                )}
                <Text
                  style={{
                    color: activeTab === tab ? "#fff" : "#6b7280",
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  {tab === "feed" ? "Safety Feed" : "AI Copilot"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "feed" ? <SafetyFeed /> : <AIAssistantPanel />}
      </View>
    </View>
  );
}
