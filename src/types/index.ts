export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  score: number;
  summary: string;
  status: 'pending' | 'in-progress' | 'completed' | 'paused';
  createdAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
  answers: Answer[];
  totalTimeSpent: number;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  timeSpent: number;
  score: number;
  feedback: string;
}

export interface Question {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  expectedAnswer?: string;
}

export interface InterviewState {
  currentCandidate: Candidate | null;
  isInterviewActive: boolean;
  isPaused: boolean;
  currentQuestion: Question | null;
  timeRemaining: number;
  showWelcomeBack: boolean;
}

export interface AppState {
  candidates: Candidate[];
  interview: InterviewState;
  activeTab: 'interviewee' | 'interviewer';
}