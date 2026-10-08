const STORAGE_KEY = "sevgili-mahkeme-live-v3";
const GAME_STATE_KEY = "sevgili-mahkeme-game-state-v1";

const defaultPlayers = {
  player1: "Yiğit",
  player2: "Eylül",
};

function loadGameState() {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const savedGameState = loadGameState();

const caseTemplates = [
  {
    category: "Geç Cevap Verme",
    story: (a, b) => `${a}, ${b}'ye “5 dakika sonra geliyorum” dedi ama 25 dakika sonra geldi. ${b} bunu saygısızlıkla eşitledi.`
  },
  {
    category: "Mesajlaşma",
    story: (a, b) => `${b}, ${a}'ya “Bir mesaj bile geç geliyorsun” diye yakındı. ${a} bunun iletişim sorunu olduğunu savundu.`
  },
  {
    category: "Arkadaş Ortamı",
    story: (a, b) => `${a} ve ${b}, arkadaş ortamında birbirlerini küçük düşürdü. Mahkeme bunu şimdi inceliyor.`
  },
  {
    category: "Telefon Kullanımı",
    story: (a, b) => `${b}, ${a}'in telefonunu kontrol etmesini gereksiz bir güven sorunu olarak tanımladı. ${a} bunun alışkanlık olduğunu savundu.`
  },
  {
    category: "Verilen Sözler",
    story: (a, b) => `${a}, ${b}'ye birlikte bir plan verdi ama son anda vazgeçti. ${b} bunu güven zedelenmesi olarak gördü.`
  },
  {
    category: "Sosyal Medya",
    story: (a, b) => `${a} ile ${b}, bir sosyal medya yorumunu farklı bağlamlarda değerlendirdi. Küçük gibi görünen olay, kırgınlığı büyüttü.`
  },
  {
    category: "Eski Sevgili",
    story: (a, b) => `${b}, ${a}'in eski sevgiliyle konuşmasını sorunlu buldu. ${a} bunun küçük ve anlamsız bir durum olduğunu iddia etti.`
  },
  {
    category: "Kıskançlık",
    story: (a, b) => `${a}, ${b}'nin yakın arkadaşlarıyla olan iletişimini sorguladı. ${b} bunu kıskançlık değil, güven sorunu olarak yorumladı.`
  },
  {
    category: "Çifte Standart",
    story: (a, b) => `${a} ile ${b}, aynı davranışı çok farklı şekilde yorumladı. Mahkeme bunun adalet ve eşitlik açısından ne anlama geldiğini sorguluyor.`
  },
  {
    category: "Plan İptali",
    story: (a, b) => `${b} için önemli bir plan hazırlayan ${a}, son anda vazgeçti. ${b} bunu saygısızlık ve güven zedelenmesi olarak değerlendirdi.`
  },
  {
    category: "Arkadaş Tavsiyesi",
    story: (a, b) => `${a}, ${b}'nin arkadaşlarının tavsiyelerine çok fazla kulak vermesinden rahatsız oldu. ${b} bunun sadece dışarıdan gelen endişe olduğunu söyledi.`
  },
  {
    category: "İlgisizlik",
    story: (a, b) => `${a} ve ${b} arasında uzun bir sessizlik dönemi yaşandı. ${b} bunun ilgisizlikten kaynaklandığını savundu.`
  }
];

const state = {
  players: { ...defaultPlayers, ...savedGameState.players },
  caseHistory: loadHistory(),
  currentCase: savedGameState.currentCase || null,
  caseNumber: Number.isInteger(savedGameState.caseNumber) ? savedGameState.caseNumber : 1,
  historyOpen: false,
  menuOpen: true,
};

const appEl = document.getElementById("app");
const newCaseBtn = document.getElementById("newCaseBtn");

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.caseHistory));
}

function saveGameState() {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify({
      players: state.players,
      currentCase: state.currentCase,
      caseNumber: state.caseNumber,
    }));
  } catch {
    // Keep the active session usable if browser storage is unavailable.
  }
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeResponsibility(hamPlayer1, hamPlayer2) {
  const total = hamPlayer1 + hamPlayer2;

  if (total <= 0) {
    return { player1: 50, player2: 50 };
  }

  const rawPlayer1 = (hamPlayer1 / total) * 100;
  const rawPlayer2 = (hamPlayer2 / total) * 100;

  let percentPlayer1 = Math.round(rawPlayer1);
  let percentPlayer2 = Math.round(rawPlayer2);

  if (percentPlayer1 + percentPlayer2 !== 100) {
    const difference = 100 - (percentPlayer1 + percentPlayer2);
    const fractionalPlayer1 = rawPlayer1 - Math.floor(rawPlayer1);
    const fractionalPlayer2 = rawPlayer2 - Math.floor(rawPlayer2);

    if (difference > 0) {
      if (fractionalPlayer1 >= fractionalPlayer2) {
        percentPlayer1 += difference;
      } else {
        percentPlayer2 += difference;
      }
    } else {
      if (fractionalPlayer1 <= fractionalPlayer2) {
        percentPlayer1 += difference;
      } else {
        percentPlayer2 += difference;
      }
    }
  }

  if (percentPlayer1 < 0) percentPlayer1 = 0;
  if (percentPlayer2 < 0) percentPlayer2 = 0;

  const finalTotal = percentPlayer1 + percentPlayer2;
  if (finalTotal !== 100) {
    const balance = 100 - finalTotal;
    if (balance > 0) {
      percentPlayer1 += balance;
    } else {
      percentPlayer2 += balance;
    }
  }

  return {
    player1: clamp(percentPlayer1, 0, 100),
    player2: clamp(100 - clamp(percentPlayer1, 0, 100), 0, 100),
  };
}

function appendJudgeMessage(text) {
  if (!state.currentCase) return;
  state.currentCase.messages.push({ role: "judge", speaker: "Hâkim", text });
}

function appendPlayerMessage(name, text) {
  if (!state.currentCase) return;
  state.currentCase.messages.push({ role: "player", speaker: name, text });
}

function sanitizePlayerName(name, fallback) {
  const value = String(name || "").trim();
  return value || fallback;
}

function getEylulCaseCount() {
  return state.caseHistory.length;
}

function startCaseFlow() {
  state.menuOpen = false;
  state.historyOpen = false;

  if (!state.currentCase || state.currentCase.result) {
    buildCase();
  }

  render();
}

function renderMenu() {
  const player1Name = sanitizePlayerName(state.players.player1, defaultPlayers.player1);
  const player2Name = sanitizePlayerName(state.players.player2, defaultPlayers.player2);
  const caseCount = getEylulCaseCount();
  const canContinue = Boolean(state.currentCase && !state.currentCase.result) || caseCount > 0;

  return `
    <section class="screen menu-screen">
      <div class="menu-card">
        <div class="eyebrow">Ana Menü</div>
        <h2>Sevgili Mahkemesi</h2>
        <p class="menu-copy">İsimleri düzenle, sonra dava aç veya kaldığın yerden devam et.</p>

        <div class="player-form">
          <div class="field-group">
            <label for="player1-input">Birinci taraf</label>
            <input id="player1-input" type="text" value="${escapeHtml(player1Name)}" maxlength="20" />
          </div>

          <div class="field-group">
            <label for="player2-input">İkinci taraf</label>
            <input id="player2-input" type="text" value="${escapeHtml(player2Name)}" maxlength="20" />
          </div>
        </div>

        <div class="summary-box">
          <span>${escapeHtml(player2Name)} ile bu zamana kadar</span>
          <strong>${caseCount} kez</strong>
          <span>davalık olduk.</span>
        </div>

        <div class="actions menu-actions">
          <button class="primary" data-action="${canContinue ? "continue-case" : "start-case"}">
            ${canContinue ? "Davaya devam et" : "Dava Başlat"}
          </button>
          <button class="secondary-btn" data-action="history-toggle">Dava Geçmişi</button>
        </div>
      </div>
    </section>
  `;
}

function detectContradiction(caseData, answer, speaker) {
  const lower = answer.toLowerCase();
  const prior = caseData.responses
    .filter((entry) => entry.speaker === speaker)
    .map((entry) => entry.answer.toLowerCase());

  if (prior.length > 0) {
    const last = prior[prior.length - 1];
    if ((last.includes("görmedim") || last.includes("duymadım")) && (lower.includes("gördüm") || lower.includes("duydum"))) {
      return `${speaker}, daha önce “görmedim/duymadım” dedin; şimdi tam tersini söylüyorsun.`;
    }
    if ((last.includes("mesaj") || last.includes("telefon")) && (lower.includes("cevap vermedim") || lower.includes("yanımda değildi"))) {
      return `${speaker}, önceki açıklamanla bu yeni anlatım çelişiyor.`;
    }
  }

  if (lower.includes("hiç") && lower.includes("gördüm")) {
    return `${speaker}, ilk açıklamanın tam tersine giden bir detay ekledin.`;
  }

  return null;
}

function buildCrossPrompt(caseData) {
  if (caseData.contradictions.length) {
    return `Mahkeme burada çelişki gördü: ${caseData.contradictions[0]}. Bu noktada açıklaman ne olur?`;
  }

  const text = caseData.responses.map((entry) => entry.answer.toLowerCase()).join(" ");
  if (text.includes("telefon") || text.includes("mesaj") || text.includes("instagram")) {
    return "Bu olayda iletişim ve zamanlama ne kadar kritik bir etken oldu? Açıklamanı yap.";
  }
  if (text.includes("arkadaş") || text.includes("grup")) {
    return "Arkadaş ortamında nasıl davrandın; bu davranışın seni nasıl etkiledi?";
  }
  if (text.includes("söz") || text.includes("plan")) {
    return "Verdiğin sözü tutmamanın seni nasıl bir duruma soktuğunu anlat.";
  }

  return randomChoice([
    "Bu olayda en kırıcı an hangisiydi?",
    "Daha adil bir çözüm için neyi farklı yapardın?",
    "Bu davada en çok hangi davranışın seni savunmasız bıraktı?",
    "Eğer bu olayı tekrar yaşasan, neyi değiştirirdin?",
    "Buradaki en zayıf nokta neydi?",
  ]);
}

function buildCase() {
  const template = randomChoice(caseTemplates);
  const player1 = state.players.player1;
  const player2 = state.players.player2;
  const accuser = Math.random() < 0.5 ? player1 : player2;
  const defendant = accuser === player1 ? player2 : player1;
  const maxCross = 2 + Math.floor(Math.random() * 3);

  const caseData = {
    id: Date.now(),
    number: state.caseNumber,
    title: template.category,
    category: template.category,
    scenario: template.story(player1, player2),
    accuser,
    defendant,
    awaiting: accuser,
    phase: "awaiting-accusation",
    responses: [],
    contradictions: [],
    messages: [],
    crossCount: 0,
    maxCross,
    result: null,
    verdict: null,
  };

  caseData.messages.push({
    role: "judge",
    speaker: "Hâkim",
    text: `⚖️ ${caseData.number}. DAVA\nDosya: “${caseData.title}”\n${caseData.scenario}\n\nSavcı: ${accuser}\nSanık: ${defendant}\n\n${accuser}, suçlamanı yap.`
  });

  state.currentCase = caseData;
  state.caseNumber += 1;
  state.historyOpen = false;
}

function concludeCase() {
  const caseData = state.currentCase;
  if (!caseData) return;

  const player1 = state.players.player1;
  const player2 = state.players.player2;

  let hamPlayer1 = 32 + Math.random() * 24;
  let hamPlayer2 = 32 + Math.random() * 24;

  if (caseData.accuser === player1) {
    hamPlayer1 += 18;
  } else {
    hamPlayer2 += 18;
  }

  if (caseData.contradictions.length) {
    const p1Contradictions = caseData.contradictions.filter((item) => item.includes(player1)).length;
    const p2Contradictions = caseData.contradictions.filter((item) => item.includes(player2)).length;
    hamPlayer1 += p1Contradictions * 8;
    hamPlayer2 += p2Contradictions * 8;
  }

  if (caseData.responses.some((entry) => entry.answer.toLowerCase().includes("özür") || entry.answer.toLowerCase().includes("sorumluluk"))) {
    const relevant = caseData.responses.find((entry) => entry.answer.toLowerCase().includes("özür") || entry.answer.toLowerCase().includes("sorumluluk"));
    if (relevant && relevant.speaker === player1) hamPlayer1 -= 10;
    if (relevant && relevant.speaker === player2) hamPlayer2 -= 10;
  }

  const percentages = normalizeResponsibility(
    clamp(hamPlayer1, 0, 100),
    clamp(hamPlayer2, 0, 100)
  );

  const player1Percent = percentages.player1;
  const player2Percent = percentages.player2;
  const higher = player1Percent >= player2Percent ? player1 : player2;
  const lower = higher === player1 ? player2 : player1;
  const verdictText = `${higher} daha kusurlu`;
  const reason = `${higher}, olayın büyük bölümünü kendi davranışı üzerinden taşıdı. ${lower} ise savunmasını daha dengeli anlattı; bu yüzden mahkeme kararı ${higher} lehine verdi.`;

  const result = {
    id: Date.now(),
    title: caseData.title,
    category: caseData.category,
    verdict: verdictText,
    reason,
    player1: player1Percent,
    player2: player2Percent,
    total: 100,
    players: { ...state.players },
    timestamp: new Date().toISOString(),
  };

  caseData.result = result;
  caseData.verdict = verdictText;
  caseData.messages.push({
    role: "judge",
    speaker: "Hâkim",
    text: `⚖️ MAHKEME KARARI\n\n${player1}: %${player1Percent} sorumluluk\n${player2}: %${player2Percent} sorumluluk\n\nToplam: %100\n\nDosya incelendi, tarafların savunmaları ve ortaya çıkan deliller değerlendirildi. ${player1}’in sorumluluğu %${player1Percent}, ${player2}’ün sorumluluğu %${player2Percent} olarak belirlenmiştir. Toplam sorumluluk %100’dür. Mahkeme dosyayı kapatmıştır.`
  });

  state.caseHistory.unshift(result);
  saveHistory();
  render();
}

function processPlayerReply(rawValue) {
  const caseData = state.currentCase;
  if (!caseData) return;

  const answer = rawValue.trim();
  if (!answer) return;

  appendPlayerMessage(caseData.awaiting, answer);
  caseData.responses.push({ speaker: caseData.awaiting, answer });

  const contradiction = detectContradiction(caseData, answer, caseData.awaiting);
  if (contradiction) {
    caseData.contradictions.push(contradiction);
    appendJudgeMessage(`⚠️ Mahkeme çelişki tespit etti. ${contradiction}`);
  }

  if (caseData.phase === "awaiting-accusation") {
    caseData.phase = "awaiting-defense";
    caseData.awaiting = caseData.defendant;
    appendJudgeMessage(`${caseData.defendant}, savunman nedir?`);
    render();
    return;
  }

  if (caseData.phase === "awaiting-defense") {
    caseData.phase = "awaiting-cross";
    caseData.awaiting = caseData.accuser;
    appendJudgeMessage(`${caseData.accuser}, ${buildCrossPrompt(caseData)}`);
    render();
    return;
  }

  if (caseData.phase === "awaiting-cross") {
    caseData.crossCount += 1;
    if (caseData.crossCount >= caseData.maxCross) {
      concludeCase();
      return;
    }

    const nextSpeaker = caseData.awaiting === caseData.accuser ? caseData.defendant : caseData.accuser;
    caseData.awaiting = nextSpeaker;
    appendJudgeMessage(`${nextSpeaker}, ${buildCrossPrompt(caseData)}`);
    render();
  }
}

function renderHistory() {
  return `
    <section class="screen">
      <div class="history-panel">
        <div class="eyebrow">Dava Geçmişi</div>
        <h3>Önceki kararlar</h3>
      </div>

      <div class="judge-thread">
        ${state.caseHistory.length
          ? state.caseHistory
              .map(
                (entry, index) => `
                  <div class="message judge">
                    <div class="speaker">${index + 1}. Dava</div>
                    <div class="bubble">
                      ${escapeHtml(entry.verdict)}<br><br>
                      ${escapeHtml(`${state.players.player1}: ${entry.player1}% kusur`)}<br>
                      ${escapeHtml(`${state.players.player2}: ${entry.player2}% kusur`)}
                    </div>
                  </div>
                `
              )
              .join("")
          : `
            <div class="message judge">
              <div class="speaker">Henüz</div>
              <div class="bubble">Mahkeme kaydı yok. İlk davasını açınca burada görünecek.</div>
            </div>
          `}
      </div>

      <div class="actions">
        <button class="primary" data-action="new-case">Yeni Dava</button>
        <button class="secondary-btn" data-action="history-close">Mahkemeye Dön</button>
      </div>
    </section>
  `;
}

function renderCase() {
  if (!state.currentCase) {
    buildCase();
  }

  if (state.currentCase.result) {
    const result = state.currentCase.result;
    return `
      <section class="screen">
        <div class="case-box">
          <div class="eyebrow">Dava ${state.currentCase.number - 1}</div>
          <h3>${state.currentCase.title}</h3>
          <p class="story">${escapeHtml(state.currentCase.scenario)}</p>
        </div>

        <div class="result-banner">
          <div class="kicker">⚖️ Mahkeme Kararı</div>
          <h3>${result.verdict}</h3>
          <p>
            ${state.players.player1}: %${result.player1} sorumluluk<br>
            ${state.players.player2}: %${result.player2} sorumluluk<br><br>
            Toplam: %100
          </p>
          <p>${result.reason}</p>
        </div>

        <div class="score-grid">
          <div class="score-box">
            <div class="kicker">${state.players.player1}</div>
            <strong>${result.player1}%</strong>
            <div class="muted">Sorumluluk</div>
          </div>
          <div class="score-box">
            <div class="kicker">${state.players.player2}</div>
            <strong>${result.player2}%</strong>
            <div class="muted">Sorumluluk</div>
          </div>
        </div>

        <div class="actions">
          <button class="primary" data-action="new-case">Yeni Dava</button>
          <button class="secondary-btn" data-action="history-toggle">Dava Geçmişi</button>
        </div>
      </section>
    `;
  }

  const messages = state.currentCase.messages
    .map(
      (entry) => `
        <div class="message ${entry.role === "judge" ? "judge" : "player"}">
          <div class="speaker">${escapeHtml(entry.speaker)}</div>
          <div class="bubble">${escapeHtml(entry.text).replace(/\n/g, "<br>")}</div>
        </div>
      `
    )
    .join("");

  const promptLabel = state.currentCase.phase === "awaiting-accusation"
    ? `${state.currentCase.accuser}, suçlamanı yap.`
    : state.currentCase.phase === "awaiting-defense"
      ? `${state.currentCase.defendant}, savunman nedir?`
      : `${state.currentCase.awaiting}, cevap ver.`;

  return `
    <section class="screen">
      <div class="case-box">
        <div class="eyebrow">Dava ${state.currentCase.number - 1}</div>
        <h3>${state.currentCase.title}</h3>
        <p class="story">${escapeHtml(state.currentCase.scenario)}</p>
        <div class="players-row">
          <div class="pill">Savcı: ${state.currentCase.accuser}</div>
          <div class="pill">Sanık: ${state.currentCase.defendant}</div>
        </div>
      </div>

      <div class="judge-thread">${messages}</div>

      <div class="reply-panel">
        <label>${promptLabel}</label>
        <textarea id="live-response" rows="5" placeholder="Cevabını buraya yaz..."></textarea>
        <div class="actions">
          <button class="primary" data-action="send-live-reply">Gönder</button>
          <button class="secondary-btn" data-action="history-toggle">Dava Geçmişi</button>
        </div>
      </div>
    </section>
  `;
}

function render() {
  if (state.menuOpen) {
    appEl.innerHTML = renderMenu();

    const player1Input = document.getElementById("player1-input");
    const player2Input = document.getElementById("player2-input");

    if (player1Input) {
      player1Input.addEventListener("input", (event) => {
        state.players.player1 = sanitizePlayerName(event.target.value, defaultPlayers.player1);
        saveGameState();
      });
    }

    if (player2Input) {
      player2Input.addEventListener("input", (event) => {
        state.players.player2 = sanitizePlayerName(event.target.value, defaultPlayers.player2);
        saveGameState();
      });
    }
  } else if (state.historyOpen) {
    appEl.innerHTML = renderHistory();
  } else {
    appEl.innerHTML = renderCase();
  }

  appEl.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "start-case") {
        state.players.player1 = sanitizePlayerName(document.getElementById("player1-input")?.value, defaultPlayers.player1);
        state.players.player2 = sanitizePlayerName(document.getElementById("player2-input")?.value, defaultPlayers.player2);
        startCaseFlow();
        return;
      }

      if (action === "continue-case") {
        if (state.currentCase && !state.currentCase.result) {
          state.menuOpen = false;
          state.historyOpen = false;
          render();
          return;
        }

        startCaseFlow();
        return;
      }

      if (action === "new-case") {
        state.menuOpen = false;
        state.historyOpen = false;
        buildCase();
        render();
        return;
      }

      if (action === "history-toggle") {
        state.menuOpen = false;
        state.historyOpen = true;
        render();
        return;
      }

      if (action === "history-close") {
        state.historyOpen = false;
        render();
        return;
      }

      if (action === "send-live-reply") {
        const input = document.getElementById("live-response");
        if (!input) return;
        processPlayerReply(input.value);
        input.value = "";
      }
    });
  });

  saveGameState();
}

newCaseBtn.addEventListener("click", () => {
  state.menuOpen = true;
  state.historyOpen = false;
  render();
});

render();
