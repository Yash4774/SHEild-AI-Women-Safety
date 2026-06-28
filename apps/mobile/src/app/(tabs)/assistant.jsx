import { Redirect } from "expo-router";

// AI Assistant has been merged into the Community tab (AI Copilot tab)
export default function AssistantRedirect() {
  return <Redirect href="/(tabs)/community" />;
}
