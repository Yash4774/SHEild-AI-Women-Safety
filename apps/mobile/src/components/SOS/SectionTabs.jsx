import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Shield, Phone, Mic, PhoneCall } from "lucide-react-native";

export function SectionTabs({ activeSection, onSectionChange }) {
  const sections = [
    { id: "sos", label: "AI Copilot", icon: Shield },
    { id: "fakecall", label: "Fake Call", icon: Phone },
    { id: "voice", label: "Voice SOS", icon: Mic },
    { id: "contacts", label: "Emergency", icon: PhoneCall },
  ];

  return (
    <>
      {sections.map((s) => {
        const Icon = s.icon;
        const active = activeSection === s.id;
        return (
          <TouchableOpacity
            key={s.id}
            onPress={() => onSectionChange(s.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: active
                ? "rgba(124,58,237,0.2)"
                : "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: active
                ? "rgba(124,58,237,0.4)"
                : "rgba(255,255,255,0.08)",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
            activeOpacity={0.7}
          >
            <Icon size={13} color={active ? "#a78bfa" : "#6b7280"} />
            <Text
              style={{
                color: active ? "#a78bfa" : "#6b7280",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}
