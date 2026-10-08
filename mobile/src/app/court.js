import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import { useGame } from "../GameProvider";
import { Button, colors, Label, Message } from "../components";
import { getPrompt } from "../game";

export default function CourtScreen() {
  const router = useRouter();
  const { activeCase, ready, sendReply, startNewCase } = useGame();
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (ready && !activeCase) router.replace("/");
  }, [ready, activeCase, router]);

  if (!ready || !activeCase) return <View style={styles.loading}><ActivityIndicator color={colors.gold} size="large" /></View>;

  function submit() {
    if (!reply.trim()) return;
    sendReply(reply);
    setReply("");
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.caseCard}>
          <View style={styles.caseTop}><Label>DAVA {activeCase.number}</Label><Text style={styles.category}>{activeCase.title}</Text></View>
          <Text style={styles.story}>{activeCase.scenario}</Text>
          <View style={styles.parties}>
            <Text style={[styles.chip, styles.accuser]}>Savcı  ·  {activeCase.accuser}</Text>
            <Text style={[styles.chip, styles.defendant]}>Sanık  ·  {activeCase.defendant}</Text>
          </View>
        </View>

        {activeCase.result ? (
          <View style={styles.verdict}>
            <Label>HÂKİM KARARI</Label>
            <Text style={styles.verdictTitle}>{activeCase.result.verdict}</Text>
            <Text style={styles.reason}>{activeCase.result.reason}</Text>
            <View style={styles.scoreRow}>
              {[activeCase.result.players.player1, activeCase.result.players.player2].map((name, index) => (
                <View key={name} style={styles.score}>
                  <Text style={styles.scoreName}>{name}</Text>
                  <Text style={styles.scoreValue}>%{index === 0 ? activeCase.result.player1 : activeCase.result.player2}</Text>
                  <Text style={styles.scoreCaption}>sorumluluk</Text>
                </View>
              ))}
            </View>
            <Text style={styles.total}>TOPLAM  ·  %{activeCase.result.player1 + activeCase.result.player2}</Text>
            <Button label="Yeni dava" onPress={startNewCase} />
            <Button label="Dava geçmişi" onPress={() => router.push("/history")} secondary />
          </View>
        ) : (
          <>
            <View style={styles.thread}>
              <View style={styles.threadHeader}>
                <View style={styles.liveDot} />
                <Text style={styles.threadTitle}>DURUŞMA TUTANAĞI</Text>
                <Text style={styles.count}>{activeCase.messages.length} kayıt</Text>
              </View>
              {activeCase.messages.map((entry, index) => <Message entry={entry} key={`${activeCase.id}-${index}`} />)}
            </View>
            <View style={styles.replyPanel}>
              <Label>SÖZ SIRASI  ·  {activeCase.awaiting.toLocaleUpperCase("tr-TR")}</Label>
              <Text style={styles.prompt}>{getPrompt(activeCase)}</Text>
              <TextInput accessibilityLabel="Dava yanıtı" multiline value={reply} onChangeText={setReply}
                placeholder="Savunmanı buraya yaz..." placeholderTextColor="#76757A" textAlignVertical="top" style={styles.replyInput} />
              <Button label="Yanıtı ilet" onPress={submit} disabled={!reply.trim()} />
              <Button label="Dava geçmişi" onPress={() => router.push("/history")} secondary />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  content: { padding: 19, paddingBottom: 38, gap: 18 },
  caseCard: { padding: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, gap: 13 },
  caseTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, category: { color: colors.goldLight, fontSize: 12, fontWeight: "700" },
  story: { color: colors.text, fontSize: 17, lineHeight: 26, fontWeight: "600" }, parties: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { overflow: "hidden", borderRadius: 5, paddingHorizontal: 9, paddingVertical: 7, fontSize: 11, fontWeight: "700" },
  accuser: { color: colors.blue, backgroundColor: "#18232D" }, defendant: { color: colors.red, backgroundColor: "#2A1D1E" },
  thread: { padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: "#101115", gap: 13 },
  threadHeader: { flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 11 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green }, threadTitle: { flex: 1, color: colors.muted, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" }, count: { color: "#737278", fontSize: 10 },
  replyPanel: { padding: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, gap: 11 },
  prompt: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: "700" },
  replyInput: { minHeight: 110, maxHeight: 180, color: colors.text, backgroundColor: "#0F1014", borderWidth: 1, borderColor: colors.border, borderRadius: 7, padding: 12, fontSize: 14, lineHeight: 21 },
  verdict: { padding: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#65563A", borderRadius: 10, gap: 13 },
  verdictTitle: { color: colors.text, fontSize: 27, lineHeight: 33, fontWeight: "900" }, reason: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  scoreRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 14 },
  score: { flex: 1, alignItems: "center", gap: 4 }, scoreName: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  scoreValue: { color: colors.goldLight, fontSize: 30, fontWeight: "900" }, scoreCaption: { color: colors.muted, fontSize: 11 },
  total: { color: colors.green, textAlign: "center", fontSize: 11, letterSpacing: 1, fontWeight: "900" },
});