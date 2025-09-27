/**
 * @file WelcomeBackModal.tsx
 * @author
 *   Your Name
 * @date 2025-09-27
 * Hand-written by [Your Name], inspired by Bolt AI scaffolding.
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Play } from 'lucide-react';
import { RootState } from '../store';
import { resumeInterview, setShowWelcomeBack } from '../store/slices/interviewSlice';

/**
 * WelcomeBackModal prompts the user to resume an unfinished interview session.
 */
const WelcomeBackModal: React.FC = () => {
  const dispatch = useDispatch();
  // Alias currentCandidate to currentApplicant for consistency
  const { showWelcomeBack, currentCandidate: currentApplicant } = useSelector(
    (state: RootState) => state.interview
  );

  if (!showWelcomeBack || !currentApplicant) return null;

  const handleResume = () => {
    dispatch(resumeInterview());
  };

  const handleDismiss = () => {
    dispatch(setShowWelcomeBack(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome Back!</h3>
          <p className="text-sm text-gray-500 mb-6">
            You have an unfinished interview session. Would you like to continue where you left off?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Candidate:</strong> {currentCandidate.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Progress:</strong> Question {currentCandidate.currentQuestionIndex + 1} of 6
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Start New Session
            </button>
            <button
              onClick={handleResume}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              <Play size={16} />
              <span>Resume</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;