import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: 'interviewee' | 'interviewer';
  selectedCandidateId: string | null;
  searchTerm: string;
  sortBy: 'score' | 'name' | 'date';
  sortOrder: 'asc' | 'desc';
}

const initialState: UiState = {
  activeTab: 'interviewee',
  selectedCandidateId: null,
  searchTerm: '',
  sortBy: 'score',
  sortOrder: 'desc'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload;
    },
    setSelectedCandidate: (state, action: PayloadAction<string | null>) => {
      state.selectedCandidateId = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'score' | 'name' | 'date'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    }
  }
});

export const { setActiveTab, setSelectedCandidate, setSearchTerm, setSortBy, setSortOrder } = uiSlice.actions;
export default uiSlice.reducer;