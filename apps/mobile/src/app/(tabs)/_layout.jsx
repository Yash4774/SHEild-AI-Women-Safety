import { Tabs } from "expo-router";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Home, Map, Shield, Users, User } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SOSTabIcon() {
  return (
    <View
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#dc2626",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 26,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 16,
        elevation: 16,
      }}
    >
      <Shield size={26} color="#fff" />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : "rgba(5,5,15,0.98)",
          borderTopWidth: Platform.OS === "ios" ? 0 : 0,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(5,5,15,0.95)",
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.07)",
              },
            ]}
          >
            {Platform.OS === "ios" && (
              <BlurView
                tint="dark"
                intensity={95}
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>
        ),
        tabBarActiveTintColor: "#a78bfa",
        tabBarInactiveTintColor: "#3f3f46",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Safety Map",
          tabBarIcon: ({ color, focused }) => (
            <Map size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: "",
          tabBarIcon: () => <SOSTabIcon />,
          tabBarLabel: () => (
            <Text
              style={{
                color: "#ef4444",
                fontSize: 10,
                fontWeight: "900",
                marginTop: -2,
              }}
            >
              SOS
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen name="assistant" options={{ href: null }} />
    </Tabs>
  );
}
