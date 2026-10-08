import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export const colors = {
  background: "#0C0D10", surface: "#14161B", raised: "#1B1D22", border: "#303039",
  gold: "#D4B36C", goldLight: "#F0D9A0", text: "#F4F0E8", muted: "#A5A4A4",
  blue: "#91B6D3", red: "#E59C91", green: "#9BD0AE",
};

export function Header({ showMenu, onMenu }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image source={require("../assets/app-logo.png")} style={styles.logo} resizeMode="contain" />
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle}>Sevgili Mahkemesi</Text>
          <Text style={styles.brandSubtitle}>İlişkinizin adalet terazisi</Text>
        </View>
      </View>
      {showMenu && <Pressable accessibilityRole="button" onPress={onMenu} style={styles.menuButton}><Text style={styles.menuButtonText}>Menü</Text></Pressable>}
    </View>
  );
}

export function Button({ label, onPress, secondary = false, disabled = false }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary ? styles.secondaryButton : styles.primaryButton, pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Message({ entry }) {
  const judge = entry.role === "judge";
  return (
    <View style={[styles.messageRow, !judge && styles.messagePlayer]}>
      <Text style={[styles.speaker, !judge && styles.speakerPlayer]}>{entry.speaker}</Text>
      <View style={[styles.bubble, judge ? styles.judgeBubble : styles.playerBubble]}><Text style={styles.messageText}>{entry.text}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 82, paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 11, flexShrink: 1 }, logo: { width: 54, height: 54, borderRadius: 9 }, brandCopy: { flexShrink: 1 },
  brandTitle: { color: colors.text, fontSize: 16, fontWeight: "800" }, brandSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
  menuButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8 }, menuButtonText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  button: { minHeight: 49, borderRadius: 8, paddingHorizontal: 17, alignItems: "center", justifyContent: "center" }, primaryButton: { backgroundColor: colors.gold },
  secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, buttonText: { color: "#17130B", fontSize: 14, fontWeight: "900" }, secondaryButtonText: { color: colors.text },
  pressed: { opacity: 0.78 }, disabled: { opacity: 0.4 }, label: { color: colors.gold, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  messageRow: { alignItems: "flex-start", gap: 5 }, messagePlayer: { alignItems: "flex-end" },
  speaker: { color: colors.gold, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, fontWeight: "800" }, speakerPlayer: { color: colors.blue },
  bubble: { maxWidth: "94%", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1 }, judgeBubble: { backgroundColor: colors.raised, borderColor: colors.border },
  playerBubble: { backgroundColor: "#18232D", borderColor: "#2B3D4A" }, messageText: { color: colors.text, fontSize: 13, lineHeight: 20 },
});