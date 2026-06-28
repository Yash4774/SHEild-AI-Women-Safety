import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PhoneCall, MessageSquare } from "lucide-react-native";
import { callEmergency, sendLocationSMS } from "@/utils/emergencyUtils";

const CONTACTS = [
  {
    name: "Emergency Services",
    number: "112",
    emoji: "🚨",
    color: "#ef4444",
    desc: "Police, Fire, Ambulance (India)",
  },
  {
    name: "Women Helpline",
    number: "1091",
    emoji: "💜",
    color: "#7c3aed",
    desc: "National Women Helpline",
  },
  {
    name: "Police Control Room",
    number: "100",
    emoji: "🚔",
    color: "#3b82f6",
    desc: "Nearest police station",
  },
  {
    name: "Ambulance",
    number: "108",
    emoji: "🏥",
    color: "#10b981",
    desc: "Medical emergency",
  },
  {
    name: "Child Helpline",
    number: "1098",
    emoji: "👶",
    color: "#f59e0b",
    desc: "Child safety & protection",
  },
];

export function EmergencyContactsSection({ location }) {
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
        Emergency Contacts
      </Text>
      <Text style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
        One-tap calling · India helplines
      </Text>
      <View style={{ gap: 12 }}>
        {CONTACTS.map((c, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => callEmergency(c.number)}
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: c.color + "0C",
                borderWidth: 1,
                borderColor: c.color + "25",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 14 }}>{c.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}
                >
                  {c.name}
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                  {c.desc}
                </Text>
                <Text
                  style={{
                    color: c.color,
                    fontWeight: "800",
                    fontSize: 18,
                    marginTop: 3,
                  }}
                >
                  {c.number}
                </Text>
              </View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: c.color + "18",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PhoneCall size={20} color={c.color} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* SMS with live location */}
      {location && (
        <TouchableOpacity
          onPress={() => sendLocationSMS(location.lat, location.lng)}
          style={{
            marginTop: 16,
            backgroundColor: "rgba(124,58,237,0.12)",
            borderWidth: 1,
            borderColor: "rgba(124,58,237,0.28)",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              backgroundColor: "rgba(124,58,237,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <MessageSquare size={20} color="#a78bfa" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
              Send Location SMS
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
              Pre-filled SMS with live GPS coordinates to 112
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
