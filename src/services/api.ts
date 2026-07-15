import type { AllowedAnswer } from '../types/game';

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startGame = async () => {
  await delay(1500);
  return { matchId: "123", status: "ready", secretPlayerPicked: true };
};

export const askQuestion = async (matchId: string, questionText: string) => {
  await delay(1500);
  const badges: AllowedAnswer[] = ['Yes', 'No', 'Probably', 'Probably Not', "Don't Know"];
  const randomBadge = badges[Math.floor(Math.random() * badges.length)];
  return { status: "success", ai_badge: randomBadge };
};

export const submitGuess = async (matchId: string, guessedName: string) => {
  await delay(1500);
  // Fake logic: let's say it's true if the guess is "Messi" (case insensitive)
  const isCorrect = guessedName.trim().toLowerCase() === 'messi'; 
  return { 
    status: "success", 
    isCorrect, 
    stats: { attempts: 1 } 
  };
};
