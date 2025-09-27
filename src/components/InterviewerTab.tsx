import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Import as SortAsc, Dessert as SortDesc, ArrowLeft, Trophy, Calendar, Phone, Mail, Clock } from 'lucide-react';
import { RootState } from '../store';
import { setSelectedCandidate, setSearchTerm, setSortBy, setSortOrder } from '../store/slices/uiSlice';
import { Candidate } from '../types';

const InterviewerTab: React.FC = () => {
  const dispatch = useDispatch();
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  const { selectedCandidateId, searchTerm, sortBy, sortOrder } = useSelector((state: RootState) => state.ui);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  // Filter and sort candidates
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSortClick = (field: 'score' | 'name' | 'date') => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder('desc'));
    }
  };

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'paused':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  if (selectedCandidate) {
    return <CandidateDetailView candidate={selectedCandidate} onBack={() => dispatch(setSelectedCandidate(null))} />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Dashboard</h1>
        <p className="text-gray-600">Manage and review candidate interviews</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <SortButton label="Score" field="score" active={sortBy === 'score'} order={sortOrder} onClick={handleSortClick} />
            <SortButton label="Name" field="name" active={sortBy === 'name'} order={sortOrder} onClick={handleSortClick} />
            <SortButton label="Date" field="date" active={sortBy === 'date'} order={sortOrder} onClick={handleSortClick} />
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {sortedCandidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
          <p className="text-gray-500">Candidates will appear here after they complete their interviews.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-200">
            {sortedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => dispatch(setSelectedCandidate(candidate.id))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                      </div>
                      {candidate.status === 'completed' && candidate.completedAt && (
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span>Completed {new Date(candidate.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                      {candidate.score}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {candidate.answers.length}/6 questions
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SortButtonProps {
  label: string;
  field: 'score' | 'name' | 'date';
  active: boolean;
  order: 'asc' | 'desc';
  onClick: (field: 'score' | 'name' | 'date') => void;
}

const SortButton: React.FC<SortButtonProps> = ({ label, field, active, order, onClick }) => (
  <button
    onClick={() => onClick(field)}
    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    <span>{label}</span>
    {active && (order === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
  </button>
);

interface CandidateDetailViewProps {
  candidate: Candidate;
  onBack: () => void;
}

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({ candidate, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-gray-600">Interview Details</p>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <p className="text-gray-900">{candidate.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{candidate.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
            <p className="text-gray-900">{candidate.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(candidate.status)}`}>
              {candidate.status}
            </span>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-blue-600">{candidate.score}%</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{candidate.answers.length}/6</div>
            <div className="text-sm text-gray-500">Questions Completed</div>
          </div>
        </div>
        {candidate.summary && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">AI Summary</h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.summary}</div>
          </div>
        )}
      </div>

      {/* Questions and Answers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions & Answers</h2>
        <div className="space-y-6">
          {candidate.answers.map((answer, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Question {index + 1} ({answer.difficulty})
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{Math.round((answer.score / 10) * 100)}%</span>
                  <span>{answer.timeSpent}s / {answer.timeLimit}s</span>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{answer.question}</p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <p className="text-sm text-gray-800">{answer.answer}</p>
              </div>
              <p className="text-sm text-gray-600">{answer.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewerTab;