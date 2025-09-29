import React from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { RootState } from '../store';

const InterviewProgress: React.FC = () => {
  const interviewState = useSelector((state: RootState) => state.interview);
  const { currentCandidate, questions } = interviewState;
  // Always select candidate record from main list for answers
  const candidateRecord = useSelector((state: RootState) =>
    state.candidates.candidates.find((c) => c.id === currentCandidate?.id),
  );
  const answers = candidateRecord?.answers ?? [];
  if (!currentCandidate) return null;
  const progressQuestions = questions && questions.length === 6 ? questions : [];

  const currentIndex = currentCandidate.currentQuestionIndex;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Interview Progress</h2>
        <span className="text-sm text-gray-500">Question {Math.min(currentIndex + 1, 6)} of 6</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {progressQuestions.length
          ? progressQuestions.map((question, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : isCurrent ? <Clock size={20} /> : <Circle size={20} />}
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {question.difficulty}
                    </div>
                    <div className="text-xs text-gray-500">{question.timeLimit}s</div>
                  </div>
                </div>
              );
            })
          : Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center opacity-50">
                <div className="w-10 h-10 rounded-full bg-gray-100 mb-2" />
                <div className="text-center text-xs text-gray-400">N/A</div>
              </div>
            ))}
      </div>

      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium">Current Score: </span>
        {(() => {
          if (answers.length === 0) return 0;
          const avg = Math.round(
            answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length,
          );
          return avg;
        })()}%
      </div>
    </div>
  );
};

export default InterviewProgress;
