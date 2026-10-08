import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useGame } from "../GameProvider";
import { Button, colors, Label } from "../components";

export default function MainMenu() {
  const router = useRouter();
  const { players, history, ready, canContinue, updatePlayer, startNewCase, activeCase } = useGame();

  function continuePlaying() {
    if (activeCase && !activeCase.result) router.push("/court");
    else {
      startNewCase();
      router.push("/court");
    }
  }

  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.gold} size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Label>ORTAK DOSYA</Label>
        <Text style={styles.hero}>İkinizin sözü de{"\n"}mahkemede.</Text>
        <Text style={styles.copy}>Bir senaryo, iki savunma ve son sözü söyleyen bir hâkim.</Text>
      </View>
      <View style={styles.section}>
        <Label>TARAFLAR</Label>
        {[["player1", "Birinci taraf"], ["player2", "İkinci taraf"]].map(([key, label]) => (
          <View key={key} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput accessibilityLabel={label} value={players[key]} onChangeText={(value) => updatePlayer(key, value)}
              maxLength={20} placeholder="İsim" placeholderTextColor="#76757A" style={styles.input} />
          </View>
        ))}
      </View>
      <View style={styles.record}>
        <View>
          <Text style={styles.recordLabel}>ORTAK DAVA GEÇMİŞİ</Text>
          <Text style={styles.recordText}>{players.player2.trim() || "Eylül"} ile <Text style={styles.goldText}>{history.length}</Text> dosya</Text>
        </View>
        <Text style={styles.recordMark}>§</Text>
      </View>
      <View style={styles.actions}>
        <Button label={canContinue ? "Davaya devam et" : "İlk davayı aç"} onPress={canContinue ? continuePlaying : () => { startNewCase(); router.push("/court"); }} />
        {history.length > 0 && <Button label="Dava geçmişi" onPress={() => router.push("/history")} secondary />}
      </View>
      <Text style={styles.note}>Kayıtlar bu cihazda saklanır.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  content: { padding: 19, paddingBottom: 38, gap: 20 },
  intro: { paddingTop: 15, gap: 8 },
  hero: { marginTop: 5, color: colors.text, fontSize: 33, lineHeight: 39, fontWeight: "900" },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  section: { gap: 12 }, field: { gap: 6 }, fieldLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  input: { minHeight: 50, color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 13, fontSize: 16 },
  record: { minHeight: 75, padding: 15, borderLeftWidth: 2, borderLeftColor: colors.gold, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recordLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  recordText: { color: colors.text, fontSize: 15, marginTop: 6, fontWeight: "600" }, goldText: { color: colors.goldLight, fontWeight: "800" }, recordMark: { color: "#66563B", fontSize: 31 },
  actions: { gap: 9 }, note: { color: "#79787C", fontSize: 11, textAlign: "center", marginTop: -8 },
});