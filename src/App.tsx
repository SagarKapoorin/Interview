import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './store';
import { setShowWelcomeBack, pauseInterview } from './store/slices/interviewSlice';
import TabNavigation from './components/TabNavigation';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const { currentCandidate: currentApplicant, isInterviewActive } =
    useSelector((state: RootState) => state.interview);

  useEffect(() => {
    // Check for unfinished interview session on load
    if (currentApplicant && isInterviewActive && currentApplicant.status === 'in-progress') {
      dispatch(setShowWelcomeBack(true));
    }
  }, [currentApplicant, isInterviewActive, dispatch]);
  
  useEffect(() => {
    // Pause interview and show modal when user closes or reloads the page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentApplicant && isInterviewActive) {
        dispatch(pauseInterview());
        dispatch(setShowWelcomeBack(true));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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