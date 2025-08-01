import React, { useContext } from 'react';
import { StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';

const QuestionCard = ({ question, isSolved, onToggleSolved, isBookmarked, onToggleBookmark }) => {
  const { user } = useContext(AuthContext);

  return (
    <div 
      className={`w-full h-24 p-4 mb-4 flex items-center justify-between rounded-lg shadow-lg transition-all duration-300 border-2 ${
        isSolved 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400' 
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
      } hover:shadow-xl hover:transform hover:scale-[1.02]`}
    >
      {/* Left side - Question name */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
          {question.question_name}
        </h3>
      </div>
      
      {/* Right side - Actions and badges */}
      <div className="flex items-center space-x-3">
        {/* Type badge */}
        <span className="px-3 py-1 bg-gray-600 dark:bg-gray-500 text-white text-xs rounded-full capitalize">
          {question.type}
        </span>
        
        {/* Difficulty badge */}
        <span 
          className={`px-3 py-1 text-xs rounded-full capitalize ${
            question.difficulty === 'easy' 
              ? 'bg-green-500 text-white' 
              : question.difficulty === 'medium' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-red-500 text-white'
          }`}
        >
          {question.difficulty}
        </span>
        
        {/* Solve link */}
        <a 
          href={question.question_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white text-xs rounded transition-colors duration-200"
        >
          Solve Problem
        </a>
        
        {/* Bookmark button */}
        {user && (
          <button 
            onClick={onToggleBookmark}
            className={`px-3 py-2 text-sm rounded transition-colors duration-200 ${
              isBookmarked 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
            }`}
          >
            {isBookmarked ? <StarIconSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
          </button>
        )}
        
        {/* Mark solved button */}
        {user && (
          <button 
            onClick={onToggleSolved}
            className={`px-4 py-2 text-white text-sm rounded transition-colors duration-200 ${
              isSolved 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isSolved ? (
              <>
                <CheckIconSolid className="inline-block w-4 h-4 mr-1" />
                Solved
              </>
            ) : (
              <>
                <CheckIcon className="inline-block w-4 h-4 mr-1" />
                Mark Solved
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
