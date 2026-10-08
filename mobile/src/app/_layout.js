import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GameProvider } from "../GameProvider";
import { colors, Header } from "../components";

function Routes() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Header showMenu={pathname !== "/"} onMenu={() => router.replace("/")} />
      <Stack screenOptions={{ headerShown: false, contentStyle: styles.stack, animation: "fade_from_bottom" }} />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <View style={styles.root}><Routes /></View>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  stack: { backgroundColor: colors.background },
});