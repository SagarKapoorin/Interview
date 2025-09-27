import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, Answer } from '../../types';

interface CandidatesState {
  candidates: Candidate[];
}

const initialState: CandidatesState = {
  candidates: []
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<Partial<Candidate> & { id: string }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload };
      }
    },
    addAnswer: (state, action: PayloadAction<{ candidateId: string; answer: Answer }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.answers.push(action.payload.answer);
      }
    },
    completeInterview: (state, action: PayloadAction<{ candidateId: string; score: number; summary: string }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.status = 'completed';
        candidate.score = action.payload.score;
        candidate.summary = action.payload.summary;
        candidate.completedAt = new Date().toISOString();
      }
    }
  }
});

export const { addCandidate, updateCandidate, addAnswer, completeInterview } = candidatesSlice.actions;
export default candidatesSlice.reducer;