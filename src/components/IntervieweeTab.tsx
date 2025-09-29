import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../store';
import {
  addCandidate,
  updateCandidate,
  addAnswer,
  completeInterview,
} from '../store/slices/candidatesSlice';
import {
  startInterview,
  setCurrentQuestion,
  endInterview,
  updateCurrentCandidate,
  setQuestions as setInterviewQuestions,
} from '../store/slices/interviewSlice';
import { aiService } from '../services/aiService';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import InterviewProgress from './InterviewProgress';
import { Candidate, Question } from '../types';

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { currentCandidate: currentApplicant, questions: reduxQuestions } = useSelector(
    (state: RootState) => state.interview,
  );
  // Candidate record from global list for summary and answers
  const candidateRecord = useSelector((state: RootState) =>
    state.candidates.candidates.find((c) => c.id === currentApplicant?.id),
  );
  // Step: upload profile, profile input, interview in progress, or completion summary
  const [step, setStep] = useState<'upload' | 'profile' | 'interview' | 'complete'>('upload');
  const [isScoring, setIsScoring] = useState(false);
  const [questions, setLocalQuestions] = useState<Question[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);


  const handleResumeUpload = (data: {
    name?: string;
    email?: string;
    phone?: string;
    text: string;
  }) => {
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
      totalTimeSpent: 0,
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
    if (currentApplicant) {
      const updatedCandidate = { ...currentApplicant, ...profileData };
      dispatch(updateCandidate({ id: currentApplicant.id, ...profileData }));
      dispatch(updateCurrentCandidate(profileData));
      startInterviewProcess(updatedCandidate);
    }
  };

  const startInterviewProcess = async (candidate: Candidate) => {
    const generatedQuestions = await aiService.generateQuestions(candidate.resumeText || '');
    // Store questions both in Redux and local state
    setLocalQuestions(generatedQuestions);
    dispatch(setInterviewQuestions(generatedQuestions));
    dispatch(updateCandidate({ id: candidate.id, status: 'in-progress' }));
    dispatch(setCurrentQuestion(generatedQuestions[0]));
    setStep('interview');
  };

  const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
    // Determine current question list: local or from Redux
    const questionList = questions.length > 0 ? questions : reduxQuestions;
    if (!currentApplicant || !questionList[currentApplicant.currentQuestionIndex]) return;
    setIsScoring(true);

    const currentQuestion = questionList[currentApplicant.currentQuestionIndex];
    const { score, feedback } = await aiService.scoreAnswer(currentQuestion, answer, timeSpent);
    setIsScoring(false);

    const answerData = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer,
      difficulty: currentQuestion.difficulty,
      timeLimit: currentQuestion.timeLimit,
      timeSpent,
      score,
      feedback,
    };

    dispatch(addAnswer({ candidateId: currentApplicant.id, answer: answerData }));

    const nextQuestionIndex = currentApplicant.currentQuestionIndex + 1;

    // Move to next question if available
    if (nextQuestionIndex < questionList.length) {
      const updatedTotalTime = currentApplicant.totalTimeSpent + timeSpent;
      const updatedAnswers = [...currentApplicant.answers, answerData];
      dispatch(
        updateCandidate({
          id: currentApplicant.id,
          currentQuestionIndex: nextQuestionIndex,
          totalTimeSpent: updatedTotalTime,
        }),
      );
      dispatch(
        updateCurrentCandidate({
          currentQuestionIndex: nextQuestionIndex,
          totalTimeSpent: updatedTotalTime,
          answers: updatedAnswers,
        }),
      );
      dispatch(setCurrentQuestion(questionList[nextQuestionIndex]));
    } else {
      // Complete interview and prepare summary view
      const allAnswers = [...currentApplicant.answers, answerData];
      const { score: finalScore, summary } = await aiService.generateSummary(allAnswers);
      dispatch(
        completeInterview({ candidateId: currentApplicant.id, score: finalScore, summary }),
      );
      setStep('complete');
    }
  };

  // Show completion summary once interview is complete
  if (step === 'complete' && currentApplicant) {
    // Use stored candidateRecord from Redux for summary and answers
    const score = candidateRecord?.score ?? 0;
    const summary = candidateRecord?.summary || '';
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
        <div className="text-xl mb-2">Final Score: {score}%</div>
        {summary && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">AI Summary</h3>
            <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
          </div>
        )}
        <button
          onClick={() => {
            dispatch(endInterview());
            setLocalQuestions([]);
            setStep('upload');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  }
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
            initialData={currentApplicant!}
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
        <ChatInterface onAnswerSubmit={handleAnswerSubmit} loading={isScoring} />
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
    phone: initialData.phone || '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (missingFields.includes('name') && !formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (missingFields.includes('email')) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required.';
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email)) {
        newErrors.email = 'Invalid email format.';
      }
    }
    if (missingFields.includes('phone')) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required.';
      } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Invalid phone number format.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
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
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
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
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
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
            className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-400' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
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
