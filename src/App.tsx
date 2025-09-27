/**
 * @file App.tsx
 * @author
 *   Your Name
 * @date 2025-09-27
 * Hand-written by [Your Name], inspired by Bolt AI scaffolding.
 */
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './store';
import { setShowWelcomeBack } from './store/slices/interviewSlice';
import TabNavigation from './components/TabNavigation';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';

/**
 * Main application content, renders tabs and welcome modal.
 * Checks for unfinished interview sessions and prompts user to continue.
 */
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  // Alias currentCandidate to currentApplicant for clearer domain language
  const { currentCandidate: currentApplicant, isInterviewActive } =
    useSelector((state: RootState) => state.interview);

  useEffect(() => {
    // TODO: enhance cross-tab persistence for interview sessions
    // Check for unfinished interview session
    if (currentApplicant && isInterviewActive && currentApplicant.status === 'in-progress') {
      dispatch(setShowWelcomeBack(true));
    }
  }, [currentApplicant, isInterviewActive, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <TabNavigation />
      <main className="pb-8">
        {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
      </main>
      <WelcomeBackModal />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      } persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;