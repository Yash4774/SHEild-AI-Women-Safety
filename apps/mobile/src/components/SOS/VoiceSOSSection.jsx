import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mic, MicOff } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VOICE_COMMANDS } from "@/constants/sosConstants";

export function VoiceSOSSection({ voiceActive, onToggleVoice }) {
  return (
    <View>
      <Text
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: "900",
          marginBottom: 6,
        }}
      >
        Voice-Activated SOS
      </Text>
      <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
        Enable to trigger SOS with voice commands
      </Text>
      <TouchableOpacity
        onPress={() => {
          onToggleVoice(!voiceActive);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={
            voiceActive
              ? ["rgba(124,58,237,0.25)", "rgba(124,58,237,0.12)"]
              : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]
          }
          style={{
            borderRadius: 22,
            padding: 24,
            borderWidth: 1,
            borderColor: voiceActive
              ? "rgba(124,58,237,0.45)"
              : "rgba(255,255,255,0.08)",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: voiceActive
                ? "rgba(124,58,237,0.25)"
                : "rgba(255,255,255,0.06)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            {voiceActive ? (
              <Mic size={34} color="#a78bfa" />
            ) : (
              <MicOff size={34} color="#52525b" />
            )}
          </View>
          <Text
            style={{
              color: voiceActive ? "#a78bfa" : "#fff",
              fontWeight: "900",
              fontSize: 20,
              marginBottom: 8,
            }}
          >
            {voiceActive ? "Voice SOS Active" : "Enable Voice SOS"}
          </Text>
          <Text
            style={{
              color: voiceActive ? "#9ca3af" : "#6b7280",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            {voiceActive
              ? '🔴 Listening for: "Help me" • "Emergency" • "Save me" • "Call police"'
              : "Tap to activate voice trigger monitoring"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: 18,
          marginTop: 16,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          Voice Commands
        </Text>
        {VOICE_COMMANDS.map((cmd, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 9,
              borderBottomWidth: i < VOICE_COMMANDS.length - 1 ? 1 : 0,
              borderBottomColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                backgroundColor: "rgba(124,58,237,0.18)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Mic size={11} color="#a78bfa" />
            </View>
            <Text
              style={{
                color: "#e5e7eb",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              "{cmd}"
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
