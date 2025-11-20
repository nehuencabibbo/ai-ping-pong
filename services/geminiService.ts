import { GoogleGenAI } from "@google/genai";
import { GameScore } from '../types';

// Initialize GenAI client
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMatchCommentary = async (
  score: GameScore,
  lastScorer: 'Player' | 'Computer',
  streak: number,
  isMatchPoint: boolean
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Commentary unavailable (Missing API Key).";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are a high-energy, witty table tennis sportscaster.
      Context:
      - Scorer: ${lastScorer}
      - Current Score: Player (Human) ${score.player} - ${score.computer} Computer (AI)
      - Streak: ${streak}
      - Match Point: ${isMatchPoint ? 'YES' : 'NO'}

      Task: Generate a SINGLE, brief sentence of commentary (max 15 words) reacting to the point. 
      Be sarcastic if the human is losing badly. Be hyped if it's a close game. 
      Don't use hash tags.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "What a shot!";
  }
};

export const generateMatchSummary = async (score: GameScore, difficulty: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Match complete.";
  }

  try {
    const winner = score.player > score.computer ? "Player" : "Computer";
    const prompt = `
      The table tennis match is over.
      Winner: ${winner}
      Final Score: ${score.player} - ${score.computer}
      Difficulty Level: ${difficulty}

      Write a short paragraph (max 50 words) summarizing the match performance. 
      If the player won on 'Impossible' mode, be extremely impressed.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Match complete. Thanks for playing!";
  }
};