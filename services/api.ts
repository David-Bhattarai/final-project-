
import { Message, EmotionResult, MoodData } from "../types";

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Sends chat to the Python ML Backend
 */
export const chatWithBackend = async (messages: Message[], input: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, input }),
    });
    if (!response.ok) throw new Error('Backend Offline');
    return await response.json();
  } catch (error) {
    console.error("Backend Connection Error:", error);
    return { 
      text: "I'm currently disconnected from my ML server. Please make sure main.py is running!",
      source: 'error' 
    };
  }
};

/**
 * Vision analysis via Flask -> Gemini 3 Flash
 */
export const analyzeEmotionWithBackend = async (imageB64: string): Promise<EmotionResult | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-emotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageB64 }),
    });
    return await response.json();
  } catch (error) {
    console.error("Vision API Error:", error);
    return null;
  }
};

/**
 * Save and Load Mood from SQLite
 */
export const saveMoodToBackend = async (score: number, label: string) => {
  try {
    await fetch(`${API_BASE_URL}/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, label }),
    });
  } catch (e) { console.warn("Mood persistence failed."); }
};

export const fetchMoodHistory = async (): Promise<MoodData[] | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/mood`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
};
