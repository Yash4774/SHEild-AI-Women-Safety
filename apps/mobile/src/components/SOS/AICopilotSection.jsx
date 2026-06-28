import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DANGER_MODES } from "@/constants/dangerModes";

export function AICopilotSection({ activeMode, onModeChange }) {
  return (
    <View>
      <Text
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: "900",
          marginBottom: 14,
        }}
      >
        What's your situation?
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -5,
          marginBottom: 16,
        }}
      >
        {DANGER_MODES.map((mode) => {
          const isActive = activeMode?.id === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onModeChange(isActive ? null : mode);
              }}
              style={{ width: "50%", padding: 5 }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  padding: 16,
                  borderRadius: 18,
                  backgroundColor: isActive
                    ? mode.color + "18"
                    : "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: isActive
                    ? mode.color + "40"
                    : "rgba(255,255,255,0.07)",
                }}
              >
                <Text style={{ fontSize: 30, marginBottom: 8 }}>
                  {mode.emoji}
                </Text>
                <Text
                  style={{
                    color: isActive ? mode.color : "#fff",
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {mode.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeMode && (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>
              {activeMode.emoji}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 17,
                flex: 1,
              }}
            >
              {activeMode.label}
            </Text>
            <TouchableOpacity
              onPress={() => onModeChange(null)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.07)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          {activeMode.steps.map((step, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <LinearGradient
                colors={["#7c3aed", "#4f46e5"]}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 11,
                  }}
                >
                  {i + 1}
                </Text>
              </LinearGradient>
              <Text
                style={{
                  color: "#e5e7eb",
                  fontSize: 14,
                  flex: 1,
                  lineHeight: 21,
                }}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
