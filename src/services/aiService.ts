import { Question, Answer } from '../types';

const MAX_RESUME_CHARS = 5000;
function truncateText(text: string, maxChars: number = MAX_RESUME_CHARS): string {
  if (text.length <= maxChars) return text;
  const snippet = text.slice(0, maxChars);
  const idx = Math.max(snippet.lastIndexOf('.'), snippet.lastIndexOf('\n'));
  if (idx > maxChars * 0.5) {
    return snippet.slice(0, idx + 1);
  }
  return snippet;
}

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/gemini` || 'http://localhost:5000/api/gemini';

export class AIService {
  async generateQuestions(resumeText: string): Promise<Question[]> {
    const textToSend = truncateText(resumeText);
    const res = await fetch(`${API_BASE}/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: textToSend }),
    });
    if (!res.ok) throw new Error('Failed to generate questions');
    return await res.json();
  }

  async scoreAnswer(
    question: Question,
    answer: string,
    timeSpent: number,
  ): Promise<{ score: number; feedback: string }> {
    const res = await fetch(`${API_BASE}/score-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, timeSpent }),
    });
    if (!res.ok) throw new Error('Failed to score answer');
    return await res.json();
  }

  async generateSummary(answers: Answer[]): Promise<{ score: number; summary: string }> {
    const res = await fetch(`${API_BASE}/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to generate summary');
    return await res.json();
  }
}


export const aiService = new AIService();
