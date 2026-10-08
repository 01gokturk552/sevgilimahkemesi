import assert from "node:assert/strict";
import test from "node:test";
import { buildCase, DEFAULT_PLAYERS, getPrompt, submitAnswer } from "./game.js";

test("case opens with judge, scenario, and accusation prompt", () => {
  const caseData = buildCase(DEFAULT_PLAYERS, 1);

  assert.equal(caseData.phase, "awaiting-accusation");
  assert.equal(caseData.messages[0].role, "judge");
  assert.match(caseData.messages[0].text, /DAVA/);
  assert.equal(getPrompt(caseData), `${caseData.accuser}, suçlamanı yap.`);
});

test("full case advances through each phase and verdict totals 100", () => {
  const players = { player1: "Yiğit", player2: "Eylül" };
  let caseData = buildCase(players, 1);
  let completedResult = null;
  let turn = 0;

  while (!completedResult && turn < 10) {
    const response = submitAnswer(caseData, `Açıklamam ${turn + 1}, sorumluluğu kabul ediyorum.`, players);
    caseData = response.caseData;
    completedResult = response.completedResult;
    turn += 1;
  }

  assert.ok(completedResult, "case should reach a verdict");
  assert.equal(completedResult.player1 + completedResult.player2, 100);
  assert.equal(completedResult.total, 100);
  assert.equal(caseData.result, completedResult);
  assert.ok(caseData.messages.some((message) => message.text.includes("Toplam: %100")));
});

test("blank response leaves the case unchanged", () => {
  const caseData = buildCase(DEFAULT_PLAYERS, 1);
  const result = submitAnswer(caseData, "   ", DEFAULT_PLAYERS);

  assert.equal(result.caseData, caseData);
  assert.equal(result.completedResult, null);
});