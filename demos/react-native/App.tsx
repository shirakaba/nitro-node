import { init } from "example-hello-world";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";

const { HelloWorld, jsiHello } = init();
const hello = new HelloWorld();
const jsiResult = jsiHello(Platform.OS);
const nitroResult = hello.greet(Platform.OS);
const hermes = (
  globalThis as typeof globalThis & {
    HermesInternal?: { getRuntimeProperties(): Record<string, unknown> };
  }
).HermesInternal?.getRuntimeProperties();
const engine = String(hermes?.["OSS Release Version"] ?? "unknown");
console.log(
  "[NitroDemo]",
  JSON.stringify({ platform: Platform.OS, jsiResult, nitroResult, hermes }),
);

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nitro v1 on {Platform.OS}</Text>
      <Text style={styles.text}>{jsiResult}</Text>
      <Text style={styles.text}>{nitroResult}</Text>
      <Text style={styles.details}>React Native 0.83 · Expo SDK 55</Text>
      <Text style={styles.details}>Hermes {engine} · JSI from RN 0.88</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  heading: { color: "#111", fontSize: 26, fontWeight: "600", marginBottom: 12 },
  text: { color: "#111", fontSize: 17 },
  details: { color: "#555", fontSize: 13 },
});
