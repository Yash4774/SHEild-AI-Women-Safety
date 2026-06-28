import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Shield,
  Bell,
  Moon,
  ChevronRight,
  LogOut,
  BarChart3,
  Lock,
  Users,
  CheckCircle,
  TrendingUp,
  Footprints,
  Zap,
  Star,
  Award,
  Target,
  MessageSquare,
  Clock,
  Navigation,
  X,
  Activity,
  Eye,
  Map,
  Heart,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

const BADGES = [
  {
    id: "first_report",
    emoji: "📋",
    name: "First Reporter",
    desc: "Filed first community report",
    color: "#ef4444",
  },
  {
    id: "safe_walk",
    emoji: "🚶‍♀️",
    name: "Safe Walker",
    desc: "Completed first Walk With Me",
    color: "#10b981",
  },
  {
    id: "guardian",
    emoji: "👼",
    name: "Guardian Angel",
    desc: "Set up Guardian Network",
    color: "#3b82f6",
  },
  {
    id: "vault",
    emoji: "🔐",
    name: "Vault Keeper",
    desc: "Uploaded evidence securely",
    color: "#6366f1",
  },
  {
    id: "checkin",
    emoji: "✅",
    name: "Check-In Pro",
    desc: "3+ successful check-ins",
    color: "#f59e0b",
  },
  {
    id: "shield",
    emoji: "🛡",
    name: "Shield Elite",
    desc: "Used 5+ safety features",
    color: "#7c3aed",
  },
];

const DNA_TRAITS = [
  { label: "Proactive Safety", score: 85, color: "#7c3aed" },
  { label: "Community Engagement", score: 62, color: "#ec4899" },
  { label: "Route Awareness", score: 78, color: "#06b6d4" },
  { label: "Emergency Preparedness", score: 91, color: "#10b981" },
  { label: "Evidence Collection", score: 45, color: "#6366f1" },
  { label: "Check-In Consistency", score: 70, color: "#f59e0b" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUser();
  const { signOut } = useAuth();
  const [reports, setReports] = useState([]);
  const [walks, setWalks] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [nightMode, setNightMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [guardianAlerts, setGuardianAlerts] = useState(true);
  const [aiProfile, setAiProfile] = useState(null);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("dna");
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Promise.all([
      fetch("/api/reports").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/walk").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/checkin").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/feed").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([reps, wlks, chk, feed]) => {
        if (Array.isArray(reps)) setReports(reps);
        if (Array.isArray(wlks)) setWalks(wlks);
        if (Array.isArray(chk)) setCheckIns(chk);
        if (Array.isArray(feed)) setFeedPosts(feed);
      })
      .catch(console.error);
  }, []);

  const safeWalks = walks.filter((w) => w.status === "completed").length;
  const arrivedCheckIns = checkIns.filter((c) => c.status === "arrived").length;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const overallScore = Math.min(
    95,
    Math.round(
      (reports.length * 8 +
        safeWalks * 12 +
        checkIns.length * 10 +
        feedPosts.length * 6) /
        5 +
        48,
    ),
  );
  const scoreColor =
    overallScore >= 75 ? "#10b981" : overallScore >= 55 ? "#f59e0b" : "#ef4444";

  // Earned badges
  const earnedIds = new Set();
  if (reports.length > 0) earnedIds.add("first_report");
  if (safeWalks > 0) earnedIds.add("safe_walk");
  if (feedPosts.length > 0) earnedIds.add("guardian");
  if (checkIns.length >= 3) earnedIds.add("checkin");
  if (earnedIds.size >= 3) earnedIds.add("shield");

  const generateAIProfile = async () => {
    setGeneratingProfile(true);
    try {
      const res = await fetch("/integrations/google-gemini-2-5-pro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Generate a personal Safety DNA analysis (2-3 sentences) for a woman with: " +
                reports.length +
                " safety reports filed, " +
                safeWalks +
                " safe walks completed, " +
                checkIns.length +
                " check-ins, " +
                feedPosts.length +
                " community posts, " +
                earnedIds.size +
                " badges earned. Analyze her safety behavior, identify her strengths and give one specific improvement tip. Be empowering and direct. No disclaimers.",
            },
          ],
          stream: false,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setAiProfile(
          d?.choices?.[0]?.message?.content ||
            "You demonstrate strong proactive safety habits with consistent community engagement. Continue building your guardian network for maximum protection.",
        );
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingProfile(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#04040E" }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ── PROFILE HERO ── */}
        <LinearGradient
          colors={["#0A0A1F", "#07071A", "#04040E"]}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          <Animated.View
            style={{
              alignItems: "center",
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Avatar */}
            <View style={{ position: "relative", marginBottom: 14 }}>
              <LinearGradient
                colors={["#7c3aed", "#db2777", "#ec4899"]}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#7c3aed",
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}
                >
                  {initials}
                </Text>
              </LinearGradient>
              <View
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  backgroundColor: "#10b981",
                  borderWidth: 2.5,
                  borderColor: "#04040E",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={13} color="#fff" />
              </View>
            </View>

            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              {user?.name || "SHEild User"}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              {user?.email || "Protected by SHEild AI"}
            </Text>

            {/* Score ring */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: scoreColor + "14",
                borderWidth: 1,
                borderColor: scoreColor + "35",
                borderRadius: 20,
                paddingHorizontal: 22,
                paddingVertical: 12,
              }}
            >
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <Text
                  style={{
                    color: scoreColor,
                    fontSize: 38,
                    fontWeight: "900",
                    lineHeight: 40,
                  }}
                >
                  {overallScore}
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Safety DNA
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  height: 40,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  marginRight: 16,
                }}
              />
              <View style={{ gap: 5 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}
                >
                  {overallScore >= 75
                    ? "Advanced Safety Level"
                    : overallScore >= 55
                      ? "Intermediate"
                      : "Building Profile"}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  {earnedIds.size} badges • {reports.length} reports
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: scoreColor,
                      marginRight: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: scoreColor,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    AI Shield Active
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Stats row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 22 }}>
            {[
              { val: safeWalks, label: "Safe Walks", color: "#10b981" },
              { val: reports.length, label: "Reports", color: "#ef4444" },
              { val: arrivedCheckIns, label: "Check-ins", color: "#f59e0b" },
              { val: earnedIds.size, label: "Badges", color: "#7c3aed" },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: s.color + "0C",
                  borderWidth: 1,
                  borderColor: s.color + "22",
                  borderRadius: 16,
                  padding: 13,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: s.color,
                    fontSize: 24,
                    fontWeight: "900",
                    lineHeight: 26,
                  }}
                >
                  {s.val}
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    fontWeight: "600",
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Section tabs */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {[
              { id: "dna", label: "Safety DNA" },
              { id: "badges", label: "Badges" },
              { id: "settings", label: "Settings" },
            ].map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => {
                  setActiveSection(s.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 11,
                  backgroundColor:
                    activeSection === s.id ? "#7c3aed" : "transparent",
                  alignItems: "center",
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: activeSection === s.id ? "#fff" : "#6b7280",
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── SAFETY DNA ── */}
          {activeSection === "dna" && (
            <View>
              {/* AI Generated Profile */}
              <View
                style={{
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.22)",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <LinearGradient
                    colors={["#7c3aed", "#4f46e5"]}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Zap size={17} color="#fff" />
                  </LinearGradient>
                  <Text
                    style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}
                  >
                    AI Safety DNA Analysis
                  </Text>
                </View>
                {aiProfile ? (
                  <Text
                    style={{ color: "#d1d5db", fontSize: 14, lineHeight: 22 }}
                  >
                    {aiProfile}
                  </Text>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 12 }}>
                    <Text
                      style={{
                        color: "#6b7280",
                        fontSize: 14,
                        textAlign: "center",
                        lineHeight: 21,
                        marginBottom: 16,
                      }}
                    >
                      Get your personalized AI safety profile based on your
                      travel habits and behavior patterns
                    </Text>
                    <TouchableOpacity
                      onPress={generateAIProfile}
                      disabled={generatingProfile}
                      style={{
                        backgroundColor: "#7c3aed",
                        borderRadius: 14,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      activeOpacity={0.8}
                    >
                      {generatingProfile ? (
                        <ActivityIndicator
                          color="#fff"
                          size="small"
                          style={{ marginRight: 8 }}
                        />
                      ) : (
                        <Zap
                          size={16}
                          color="#fff"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: 14,
                        }}
                      >
                        {generatingProfile
                          ? "Analyzing..."
                          : "Generate My Safety DNA"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {aiProfile && (
                  <TouchableOpacity
                    onPress={generateAIProfile}
                    disabled={generatingProfile}
                    style={{ marginTop: 12, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        color: "#a78bfa",
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      Regenerate Analysis
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* DNA Trait Bars */}
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "900",
                  marginBottom: 14,
                }}
              >
                Safety Trait Scores
              </Text>
              <View style={{ gap: 14, marginBottom: 22 }}>
                {DNA_TRAITS.map((trait, i) => (
                  <View key={i}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: "#e5e7eb",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {trait.label}
                      </Text>
                      <Text
                        style={{
                          color: trait.color,
                          fontWeight: "900",
                          fontSize: 14,
                        }}
                      >
                        {trait.score}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 7,
                        backgroundColor: "rgba(255,255,255,0.07)",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: trait.score + "%",
                          backgroundColor: trait.color,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── BADGES ── */}
          {activeSection === "badges" && (
            <View>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 21,
                  marginBottom: 18,
                }}
              >
                Earn badges by using SHEild AI features. {earnedIds.size} of{" "}
                {BADGES.length} earned.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: -6,
                }}
              >
                {BADGES.map((badge, i) => {
                  const earned = earnedIds.has(badge.id);
                  return (
                    <View
                      key={i}
                      style={{
                        width: "50%",
                        paddingHorizontal: 6,
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: earned
                            ? badge.color + "14"
                            : "rgba(255,255,255,0.03)",
                          borderWidth: 1,
                          borderColor: earned
                            ? badge.color + "35"
                            : "rgba(255,255,255,0.07)",
                          borderRadius: 18,
                          padding: 18,
                          alignItems: "center",
                          opacity: earned ? 1 : 0.45,
                        }}
                      >
                        <Text style={{ fontSize: 36, marginBottom: 10 }}>
                          {badge.emoji}
                        </Text>
                        <Text
                          style={{
                            color: earned ? "#fff" : "#6b7280",
                            fontWeight: "800",
                            fontSize: 14,
                            textAlign: "center",
                            marginBottom: 6,
                          }}
                        >
                          {badge.name}
                        </Text>
                        <Text
                          style={{
                            color: "#6b7280",
                            fontSize: 11,
                            textAlign: "center",
                            lineHeight: 16,
                          }}
                        >
                          {badge.desc}
                        </Text>
                        {earned && (
                          <View
                            style={{
                              marginTop: 10,
                              backgroundColor: badge.color + "22",
                              borderRadius: 8,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: badge.color,
                                fontWeight: "800",
                                fontSize: 11,
                              }}
                            >
                              ✓ EARNED
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <View>
              {[
                {
                  title: "Safety Features",
                  items: [
                    {
                      icon: Bell,
                      label: "Push Notifications",
                      toggle: true,
                      value: notifications,
                      onChange: setNotifications,
                      color: "#f59e0b",
                    },
                    {
                      icon: Moon,
                      label: "Night Safety Mode",
                      toggle: true,
                      value: nightMode,
                      onChange: setNightMode,
                      color: "#7c3aed",
                    },
                    {
                      icon: Shield,
                      label: "Guardian Alerts",
                      toggle: true,
                      value: guardianAlerts,
                      onChange: setGuardianAlerts,
                      color: "#10b981",
                    },
                    {
                      icon: Navigation,
                      label: "Background Location",
                      toggle: false,
                      color: "#3b82f6",
                    },
                  ],
                },
                {
                  title: "Account",
                  items: [
                    {
                      icon: Users,
                      label: "Guardian Network",
                      toggle: false,
                      color: "#ec4899",
                    },
                    {
                      icon: Lock,
                      label: "Privacy & Security",
                      toggle: false,
                      color: "#6366f1",
                    },
                    {
                      icon: BarChart3,
                      label: "Safety Analytics",
                      toggle: false,
                      color: "#06b6d4",
                    },
                    {
                      icon: Heart,
                      label: "Emergency Contacts",
                      toggle: false,
                      color: "#ef4444",
                    },
                  ],
                },
              ].map((section, si) => (
                <View key={si} style={{ marginBottom: 22 }}>
                  <Text
                    style={{
                      color: "#52525b",
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 12,
                    }}
                  >
                    {section.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    {section.items.map((item, ii) => {
                      const Icon = item.icon;
                      return (
                        <View
                          key={ii}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 16,
                            borderBottomWidth:
                              ii < section.items.length - 1 ? 1 : 0,
                            borderBottomColor: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <LinearGradient
                            colors={[item.color + "30", item.color + "18"]}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 14,
                            }}
                          >
                            <Icon size={17} color={item.color} />
                          </LinearGradient>
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: 15,
                              flex: 1,
                            }}
                          >
                            {item.label}
                          </Text>
                          {item.toggle ? (
                            <Switch
                              value={item.value}
                              onValueChange={item.onChange}
                              trackColor={{
                                false: "rgba(255,255,255,0.1)",
                                true: item.color + "70",
                              }}
                              thumbColor={item.value ? item.color : "#374151"}
                            />
                          ) : (
                            <ChevronRight size={16} color="#4b5563" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Sign out */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Sign Out", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Sign Out",
                      style: "destructive",
                      onPress: () => signOut(),
                    },
                  ])
                }
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.22)",
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
                activeOpacity={0.8}
              >
                <LogOut size={17} color="#f87171" style={{ marginRight: 10 }} />
                <Text
                  style={{ color: "#f87171", fontWeight: "800", fontSize: 15 }}
                >
                  Sign Out
                </Text>
              </TouchableOpacity>

              <View
                style={{ alignItems: "center", paddingBottom: 8, marginTop: 4 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Shield
                    size={11}
                    color="#4b5563"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: "#4b5563", fontSize: 11 }}>
                    SHEild AI v2.0 — Powered by Gemini 2.5 Pro
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
