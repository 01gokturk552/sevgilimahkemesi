export const DEFAULT_PLAYERS = { player1: "Yiğit", player2: "Eylül" };

const templates = [
  ["Geç Cevap Verme", (a, b) => `${a}, ${b}'ye “5 dakika sonra geliyorum” dedi ama 25 dakika sonra geldi. ${b} bunu saygısızlıkla eşitledi.`],
  ["Mesajlaşma", (a, b) => `${b}, ${a}'ya “Bir mesaj bile geç geliyorsun” diye yakındı. ${a} bunun iletişim sorunu olduğunu savundu.`],
  ["Arkadaş Ortamı", (a, b) => `${a} ve ${b}, arkadaş ortamında birbirlerini küçük düşürdü. Mahkeme bunu şimdi inceliyor.`],
  ["Telefon Kullanımı", (a, b) => `${b}, ${a}'in telefonunu kontrol etmesini gereksiz bir güven sorunu olarak tanımladı. ${a} bunun alışkanlık olduğunu savundu.`],
  ["Verilen Sözler", (a, b) => `${a}, ${b}'ye birlikte bir plan verdi ama son anda vazgeçti. ${b} bunu güven zedelenmesi olarak gördü.`],
  ["Sosyal Medya", (a, b) => `${a} ile ${b}, bir sosyal medya yorumunu farklı bağlamlarda değerlendirdi. Küçük gibi görünen olay, kırgınlığı büyüttü.`],
  ["Eski Sevgili", (a, b) => `${b}, ${a}'in eski sevgiliyle konuşmasını sorunlu buldu. ${a} bunun küçük ve anlamsız bir durum olduğunu iddia etti.`],
  ["Kıskançlık", (a, b) => `${a}, ${b}'nin yakın arkadaşlarıyla olan iletişimini sorguladı. ${b} bunu kıskançlık değil, güven sorunu olarak yorumladı.`],
  ["Çifte Standart", (a, b) => `${a} ile ${b}, aynı davranışı çok farklı şekilde yorumladı. Mahkeme bunun adalet ve eşitlik açısından ne anlama geldiğini sorguluyor.`],
  ["Plan İptali", (a, b) => `${b} için önemli bir plan hazırlayan ${a}, son anda vazgeçti. ${b} bunu saygısızlık ve güven zedelenmesi olarak değerlendirdi.`],
  ["Arkadaş Tavsiyesi", (a, b) => `${a}, ${b}'nin arkadaşlarının tavsiyelerine çok fazla kulak vermesinden rahatsız oldu. ${b} bunun sadece dışarıdan gelen endişe olduğunu söyledi.`],
  ["İlgisizlik", (a, b) => `${a} ve ${b} arasında uzun bir sessizlik dönemi yaşandı. ${b} bunun ilgisizlikten kaynaklandığını savundu.`],
];

const crossPrompts = [
  "Bu olayda en kırıcı an hangisiydi?",
  "Daha adil bir çözüm için neyi farklı yapardın?",
  "Bu davada en çok hangi davranışın seni savunmasız bıraktı?",
  "Eğer bu olayı tekrar yaşasan, neyi değiştirirdin?",
  "Buradaki en zayıf nokta neydi?",
];

const choose = (items) => items[Math.floor(Math.random() * items.length)];

function crossPrompt(caseData) {
  if (caseData.contradictions.length) {
    return `Mahkeme burada çelişki gördü: ${caseData.contradictions[0]}. Bu noktada açıklaman ne olur?`;
  }
  const answers = caseData.responses.map((entry) => entry.answer.toLowerCase()).join(" ");
  if (["telefon", "mesaj", "instagram"].some((word) => answers.includes(word))) return "Bu olayda iletişim ve zamanlama ne kadar kritik bir etken oldu? Açıklamanı yap.";
  if (["arkadaş", "grup"].some((word) => answers.includes(word))) return "Arkadaş ortamında nasıl davrandın; bu davranışın seni nasıl etkiledi?";
  if (["söz", "plan"].some((word) => answers.includes(word))) return "Verdiğin sözü tutmamanın seni nasıl bir duruma soktuğunu anlat.";
  return choose(crossPrompts);
}

function contradictionFor(caseData, answer, speaker) {
  const lower = answer.toLowerCase();
  const prior = caseData.responses.filter((entry) => entry.speaker === speaker).map((entry) => entry.answer.toLowerCase());
  if (prior.length) {
    const last = prior[prior.length - 1];
    if ((last.includes("görmedim") || last.includes("duymadım")) && (lower.includes("gördüm") || lower.includes("duydum"))) return `${speaker}, daha önce “görmedim/duymadım” dedin; şimdi tam tersini söylüyorsun.`;
    if ((last.includes("mesaj") || last.includes("telefon")) && (lower.includes("cevap vermedim") || lower.includes("yanımda değildi"))) return `${speaker}, önceki açıklamanla bu yeni anlatım çelişiyor.`;
  }
  if (lower.includes("hiç") && lower.includes("gördüm")) return `${speaker}, ilk açıklamanın tam tersine giden bir detay ekledin.`;
  return null;
}

export function buildCase(players, number) {
  const [title, story] = choose(templates);
  const accuser = Math.random() < 0.5 ? players.player1 : players.player2;
  const defendant = accuser === players.player1 ? players.player2 : players.player1;
  const caseData = {
    id: Date.now(), number, title, scenario: story(players.player1, players.player2), accuser, defendant,
    awaiting: accuser, phase: "awaiting-accusation", responses: [], contradictions: [], messages: [],
    crossCount: 0, maxCross: 2 + Math.floor(Math.random() * 3), result: null,
  };
  caseData.messages.push({
    role: "judge",
    speaker: "Hâkim",
    text: `⚖️ ${number}. DAVA\nDosya: “${title}”\n${caseData.scenario}\n\nSavcı: ${accuser}\nSanık: ${defendant}\n\n${accuser}, suçlamanı yap.`,
  });
  return caseData;
}

export function getPrompt(caseData) {
  if (caseData.phase === "awaiting-accusation") return `${caseData.accuser}, suçlamanı yap.`;
  if (caseData.phase === "awaiting-defense") return `${caseData.defendant}, savunman nedir?`;
  return `${caseData.awaiting}, cevap ver.`;
}

function makeVerdict(caseData, players) {
  let raw1 = 32 + Math.random() * 24 + (caseData.accuser === players.player1 ? 18 : 0);
  let raw2 = 32 + Math.random() * 24 + (caseData.accuser === players.player2 ? 18 : 0);
  raw1 += caseData.contradictions.filter((entry) => entry.includes(players.player1)).length * 8;
  raw2 += caseData.contradictions.filter((entry) => entry.includes(players.player2)).length * 8;
  const apology = caseData.responses.find((entry) => /özür|sorumluluk/i.test(entry.answer));
  if (apology?.speaker === players.player1) raw1 -= 10;
  if (apology?.speaker === players.player2) raw2 -= 10;
  raw1 = Math.max(0, Math.min(raw1, 100));
  raw2 = Math.max(0, Math.min(raw2, 100));
  const total = raw1 + raw2;
  const player1Percent = total ? Math.round((raw1 / total) * 100) : 50;
  const player2Percent = 100 - player1Percent;
  const higher = player1Percent >= player2Percent ? players.player1 : players.player2;
  const lower = higher === players.player1 ? players.player2 : players.player1;
  const reason = `${higher}, olayın büyük bölümünü kendi davranışı üzerinden taşıdı. ${lower} ise savunmasını daha dengeli anlattı.`;
  return {
    id: Date.now(), title: caseData.title, verdict: `${higher} daha kusurlu`, reason,
    player1: player1Percent, player2: player2Percent, total: 100,
    players: { ...players }, timestamp: new Date().toISOString(),
  };
}

export function submitAnswer(caseData, rawAnswer, players) {
  const answer = rawAnswer.trim();
  if (!answer) return { caseData, completedResult: null };
  const next = {
    ...caseData,
    responses: [...caseData.responses, { speaker: caseData.awaiting, answer }],
    contradictions: [...caseData.contradictions],
    messages: [...caseData.messages, { role: "player", speaker: caseData.awaiting, text: answer }],
  };
  const contradiction = contradictionFor(next, answer, next.awaiting);
  if (contradiction) {
    next.contradictions.push(contradiction);
    next.messages.push({ role: "judge", speaker: "Hâkim", text: `⚠️ Mahkeme çelişki tespit etti. ${contradiction}` });
  }
  if (next.phase === "awaiting-accusation") {
    next.phase = "awaiting-defense";
    next.awaiting = next.defendant;
    next.messages.push({ role: "judge", speaker: "Hâkim", text: `${next.defendant}, savunman nedir?` });
    return { caseData: next, completedResult: null };
  }
  if (next.phase === "awaiting-defense") {
    next.phase = "awaiting-cross";
    next.awaiting = next.accuser;
    next.messages.push({ role: "judge", speaker: "Hâkim", text: `${next.accuser}, ${crossPrompt(next)}` });
    return { caseData: next, completedResult: null };
  }
  next.crossCount += 1;
  if (next.crossCount >= next.maxCross) {
    const result = makeVerdict(next, players);
    next.result = result;
    next.messages.push({
      role: "judge", speaker: "Hâkim",
      text: `⚖️ MAHKEME KARARI\n\n${players.player1}: %${result.player1} sorumluluk\n${players.player2}: %${result.player2} sorumluluk\n\nToplam: %100\n\n${result.reason} Mahkeme dosyayı kapatmıştır.`,
    });
    return { caseData: next, completedResult: result };
  }
  next.awaiting = next.awaiting === next.accuser ? next.defendant : next.accuser;
  next.messages.push({ role: "judge", speaker: "Hâkim", text: `${next.awaiting}, ${crossPrompt(next)}` });
  return { caseData: next, completedResult: null };
}