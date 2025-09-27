/**
 * @file IntervieweeTab.tsx
 * @author
 *   Your Name
 * @date 2025-09-27
 * Hand-written by [Your Name], inspired by Bolt AI scaffolding.
 */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../store';
import { addCandidate, updateCandidate, addAnswer, completeInterview } from '../store/slices/candidatesSlice';
import { startInterview, setCurrentQuestion, endInterview, updateCurrentCandidate } from '../store/slices/interviewSlice';
import { aiService } from '../services/aiService';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import InterviewProgress from './InterviewProgress';
import { Candidate, Question } from '../types';

/**
 * IntervieweeTab presents the candidate-facing flow:
 *  - Resume upload
 *  - Profile completion
 *  - Live Q&A via chat interface
 */
const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  // Alias currentCandidate to currentApplicant for clearer domain context
  const { currentCandidate: currentApplicant, isInterviewActive } =
    useSelector((state: RootState) => state.interview);
  const [step, setStep] = useState<'upload' | 'profile' | 'interview'>('upload');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    // FIXME: handle aiService errors gracefully
    if (currentCandidate && currentCandidate.status === 'in-progress' && questions.length === 0) {
      const generatedQuestions = aiService.generateQuestions();
      setQuestions(generatedQuestions);
      if (currentCandidate.currentQuestionIndex < generatedQuestions.length) {
        dispatch(setCurrentQuestion(generatedQuestions[currentCandidate.currentQuestionIndex]));
      }
    }
  }, [currentCandidate, dispatch, questions.length]);

  const handleResumeUpload = (data: { name?: string; email?: string; phone?: string; text: string }) => {
    const missing = [];
    if (!data.name) missing.push('name');
    if (!data.email) missing.push('email');
    if (!data.phone) missing.push('phone');

    const candidate: Candidate = {
      id: uuidv4(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      resumeText: data.text,
      score: 0,
      summary: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      answers: [],
      totalTimeSpent: 0
    };

    dispatch(addCandidate(candidate));
    dispatch(startInterview(candidate));

    if (missing.length > 0) {
      setMissingFields(missing);
      setStep('profile');
    } else {
      startInterviewProcess(candidate);
    }
  };

  const handleProfileComplete = (profileData: { name: string; email: string; phone: string }) => {
    if (currentCandidate) {
      const updatedCandidate = { ...currentCandidate, ...profileData };
      dispatch(updateCandidate({ id: currentCandidate.id, ...profileData }));
      dispatch(updateCurrentCandidate(profileData));
      startInterviewProcess(updatedCandidate);
    }
  };

  const startInterviewProcess = (candidate: Candidate) => {
    const generatedQuestions = aiService.generateQuestions();
    setQuestions(generatedQuestions);
    dispatch(updateCandidate({ id: candidate.id, status: 'in-progress' }));
    dispatch(setCurrentQuestion(generatedQuestions[0]));
    setStep('interview');
  };

  const handleAnswerSubmit = (answer: string, timeSpent: number) => {
    if (!currentCandidate || !questions[currentCandidate.currentQuestionIndex]) return;

    const currentQuestion = questions[currentCandidate.currentQuestionIndex];
    const { score, feedback } = aiService.scoreAnswer(currentQuestion, answer, timeSpent);

    const answerData = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer,
      difficulty: currentQuestion.difficulty,
      timeLimit: currentQuestion.timeLimit,
      timeSpent,
      score,
      feedback
    };

    dispatch(addAnswer({ candidateId: currentCandidate.id, answer: answerData }));

    const nextQuestionIndex = currentCandidate.currentQuestionIndex + 1;
    
    if (nextQuestionIndex < questions.length) {
      // Move to next question
      dispatch(updateCandidate({ 
        id: currentCandidate.id, 
        currentQuestionIndex: nextQuestionIndex,
        totalTimeSpent: currentCandidate.totalTimeSpent + timeSpent
      }));
      dispatch(updateCurrentCandidate({ 
        currentQuestionIndex: nextQuestionIndex,
        totalTimeSpent: currentCandidate.totalTimeSpent + timeSpent
      }));
      dispatch(setCurrentQuestion(questions[nextQuestionIndex]));
    } else {
      // Complete interview
      const allAnswers = [...currentCandidate.answers, answerData];
      const { score: finalScore, summary } = aiService.generateSummary(allAnswers);
      
      dispatch(completeInterview({ 
        candidateId: currentCandidate.id, 
        score: finalScore, 
        summary 
      }));
      dispatch(endInterview());
      setStep('upload');
      setQuestions([]);
    }
  };

  if (step === 'upload') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Interview Assistant</h1>
          <p className="text-lg text-gray-600">
            Upload your resume to begin your Full Stack Developer interview
          </p>
        </div>
        <ResumeUpload onFileUploaded={handleResumeUpload} />
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            We need a few more details before we can start your interview.
          </p>
          <ProfileForm
            missingFields={missingFields}
            initialData={currentCandidate!}
            onComplete={handleProfileComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <InterviewProgress />
      <div className="mt-6">
        <ChatInterface
          onAnswerSubmit={handleAnswerSubmit}
        />
      </div>
    </div>
  );
};

interface ProfileFormProps {
  missingFields: string[];
  initialData: Candidate;
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ missingFields, initialData, onComplete }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {missingFields.includes('name') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      {missingFields.includes('email') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      {missingFields.includes('phone') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Start Interview
      </button>
    </form>
  );
};

export default IntervieweeTab;