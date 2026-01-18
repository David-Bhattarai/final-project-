
export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface MoodData {
  day: string;
  score: number;
  label: string;
}

export interface EmotionResult {
  emotion: string;
  confidence: number;
  stressLevel: number;
  advice: string;
}

export interface User {
  name: string;
  role: 'User' | 'Therapist' | 'Admin';
}
