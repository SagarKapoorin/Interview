/**
 * @file TabNavigation.tsx
 * @author
 *   Your Name
 * @date 2025-09-27
 * Hand-written by [Your Name], inspired by Bolt AI scaffolding.
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, MessageCircle } from 'lucide-react';
import { RootState } from '../store';
import { setActiveTab } from '../store/slices/uiSlice';

/**
 * TabNavigation renders the top-level tab bar for switching between views.
 */
const TabNavigation: React.FC = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <button
            onClick={() => dispatch(setActiveTab('interviewee'))}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'interviewee'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageCircle size={20} />
            <span>Interviewee</span>
          </button>
          <button
            onClick={() => dispatch(setActiveTab('interviewer'))}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'interviewer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={20} />
            <span>Interviewer Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;