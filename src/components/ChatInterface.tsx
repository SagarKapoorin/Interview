import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Send, Clock, Bot, User } from 'lucide-react';
import { RootState } from '../store';
import { useTimer } from '../hooks/useTimer';

interface ChatInterfaceProps {
  onAnswerSubmit: (answer: string, timeSpent: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAnswerSubmit }) => {
  const { currentCandidate, currentQuestion, isPaused } = useSelector((state: RootState) => state.interview);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'bot' | 'user'; message: string; timestamp: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTimeout = () => {
    if (currentQuestion) {
      const timeSpent = currentQuestion.timeLimit;
      onAnswerSubmit(currentAnswer || 'No answer provided', timeSpent);
      setCurrentAnswer('');
      setChatHistory(prev => [...prev, 
        { type: 'user', message: currentAnswer || 'No answer provided', timestamp: new Date() }
      ]);
    }
  };

  const { timeRemaining } = useTimer(
    currentQuestion?.timeLimit || 0,
    handleTimeout,
    !isPaused && !!currentQuestion
  );

  useEffect(() => {
    if (currentQuestion) {
      setChatHistory(prev => [...prev, {
        type: 'bot',
        message: `**Question ${(currentCandidate?.currentQuestionIndex || 0) + 1} (${currentQuestion.difficulty})**\n\n${currentQuestion.question}`,
        timestamp: new Date()
      }]);
    }
  }, [currentQuestion, currentCandidate?.currentQuestionIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.trim() && currentQuestion) {
      const timeSpent = currentQuestion.timeLimit - timeRemaining;
      setChatHistory(prev => [...prev, {
        type: 'user',
        message: currentAnswer,
        timestamp: new Date()
      }]);
      onAnswerSubmit(currentAnswer, timeSpent);
      setCurrentAnswer('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 10) return 'text-red-500';
    if (timeRemaining <= 30) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Interview Assistant</h3>
            <p className="text-sm text-gray-500">Full Stack Developer Interview</p>
          </div>
        </div>
        {currentQuestion && (
          <div className={`flex items-center space-x-2 ${getTimeColor()} font-mono font-bold`}>
            <Clock size={16} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div className="bg-blue-50 rounded-lg p-3 max-w-md">
              <p className="text-sm text-gray-700">
                Welcome to your Full Stack Developer interview! I'll be asking you 6 questions of increasing difficulty. 
                Take your time to think through each answer, but remember there's a timer for each question.
              </p>
            </div>
          </div>
        )}
        
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              message.type === 'bot' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {message.type === 'bot' ? (
                <Bot className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className={`rounded-lg p-3 max-w-md ${
              message.type === 'bot' ? 'bg-blue-50' : 'bg-gray-50'
            }`}>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {message.message.includes('**') ? (
                  <div dangerouslySetInnerHTML={{
                    __html: message.message
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>')
                  }} />
                ) : (
                  message.message
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {currentQuestion && (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isPaused}
            />
            <button
              type="submit"
              disabled={!currentAnswer.trim() || isPaused}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>Submit</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatInterface;