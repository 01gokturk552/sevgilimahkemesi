import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildCase, DEFAULT_PLAYERS, submitAnswer } from "./game";

const STORAGE_KEY = "sevgili-mahkemesi-mobile-v1";
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [history, setHistory] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [caseNumber, setCaseNumber] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        const saved = JSON.parse(raw);
        setPlayers({ ...DEFAULT_PLAYERS, ...saved.players });
        setHistory(Array.isArray(saved.history) ? saved.history : []);
        setActiveCase(saved.activeCase || null);
        setCaseNumber(Number.isInteger(saved.caseNumber) ? saved.caseNumber : 1);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ players, history, activeCase, caseNumber })).catch(() => {});
  }, [ready, players, history, activeCase, caseNumber]);

  function updatePlayer(key, value) {
    setPlayers((current) => ({ ...current, [key]: value }));
  }

  function startNewCase() {
    const safePlayers = {
      player1: players.player1.trim() || DEFAULT_PLAYERS.player1,
      player2: players.player2.trim() || DEFAULT_PLAYERS.player2,
    };
    setPlayers(safePlayers);
    const nextCase = buildCase(safePlayers, caseNumber);
    setActiveCase(nextCase);
    setCaseNumber((number) => number + 1);
  }

  function sendReply(answer) {
    if (!activeCase || !answer.trim()) return;
    const { caseData, completedResult } = submitAnswer(activeCase, answer, players);
    setActiveCase(caseData);
    if (completedResult) setHistory((items) => [completedResult, ...items]);
  }

  const value = {
    players,
    history,
    activeCase,
    ready,
    canContinue: Boolean(activeCase && !activeCase.result) || history.length > 0,
    updatePlayer,
    startNewCase,
    sendReply,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used within GameProvider");
  return value;
}