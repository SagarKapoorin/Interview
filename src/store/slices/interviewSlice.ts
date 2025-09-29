import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, Question, InterviewState } from '../../types';

const initialState: InterviewState = {
  currentCandidate: null,
  isInterviewActive: false,
  isPaused: false,
  currentQuestion: null,
  timeRemaining: 0,
  showWelcomeBack: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<Candidate>) => {
      state.currentCandidate = action.payload;
      state.isInterviewActive = true;
      state.isPaused = false;
      state.showWelcomeBack = false;
    },
    pauseInterview: (state) => {
      state.isPaused = true;
    },
    resumeInterview: (state) => {
      state.isPaused = false;
      state.showWelcomeBack = false;
    },
    endInterview: (state) => {
      state.currentCandidate = null;
      state.isInterviewActive = false;
      state.currentQuestion = null;
      state.timeRemaining = 0;
      state.isPaused = false;
      state.showWelcomeBack = false;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.timeRemaining = action.payload.timeLimit;
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    setShowWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
    updateCurrentCandidate: (state, action: PayloadAction<Partial<Candidate>>) => {
      if (state.currentCandidate) {
        state.currentCandidate = { ...state.currentCandidate, ...action.payload };
      }
    },
  },
});

export const {
  startInterview,
  pauseInterview,
  resumeInterview,
  endInterview,
  setCurrentQuestion,
  updateTimeRemaining,
  setShowWelcomeBack,
  updateCurrentCandidate,
} = interviewSlice.actions;
export default interviewSlice.reducer;
