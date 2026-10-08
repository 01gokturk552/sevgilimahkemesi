import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useGame } from "../GameProvider";
import { Button, colors, Label } from "../components";

export default function HistoryScreen() {
  const router = useRouter();
  const { history, ready } = useGame();

  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.gold} size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Label>ARŞİV</Label>
        <Text style={styles.title}>Dava geçmişi</Text>
        <Text style={styles.copy}>{history.length} tamamlanmış karar</Text>
      </View>
      {history.length === 0 ? (
        <View style={styles.empty}><Text style={styles.copy}>Henüz tamamlanmış bir dava yok.</Text></View>
      ) : history.map((entry, index) => (
        <View key={`${entry.id}-${index}`} style={styles.item}>
          <View style={styles.itemTop}>
            <Text style={styles.number}>DOSYA {history.length - index}</Text>
            <Text style={styles.category}>{entry.title}</Text>
          </View>
          <Text style={styles.verdict}>{entry.verdict}</Text>
          <View style={styles.scores}>
            <Text style={styles.scoreText}>{entry.players.player1}  %{entry.player1}</Text>
            <Text style={styles.scoreText}>{entry.players.player2}  %{entry.player2}</Text>
          </View>
        </View>
      ))}
      <Button label="Ana menüye dön" onPress={() => router.replace("/")} secondary />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  content: { padding: 19, paddingBottom: 38, gap: 17 },
  intro: { paddingTop: 15, gap: 8 }, title: { color: colors.text, fontSize: 33, lineHeight: 39, fontWeight: "900", marginTop: 5 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  item: { padding: 14, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 11 },
  itemTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, number: { color: colors.muted, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  category: { color: colors.goldLight, fontSize: 12, fontWeight: "700" }, verdict: { color: colors.text, fontSize: 17, fontWeight: "800" },
  scores: { flexDirection: "row", gap: 16 }, scoreText: { color: colors.goldLight, fontSize: 12, fontWeight: "700" },
  empty: { paddingVertical: 25 },
});