import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { BookmarkIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import QuestionCard from '../components/QuestionCard';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const BookmarksPage = () => {
  const { user, token } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Get bookmarked questions from local storage or state
  const getBookmarkedQuestions = () => {
    const saved = localStorage.getItem(`bookmarks_${user?.id}`);
    return saved ? JSON.parse(saved) : {};
  };

  // Save bookmarks to local storage
  const saveBookmarks = (bookmarks) => {
    localStorage.setItem(`bookmarks_${user?.id}`, JSON.stringify(bookmarks));
  };

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/questions`);
      setQuestions(response.data);
      
      // Load bookmarks from local storage
      const savedBookmarks = getBookmarkedQuestions();
      setBookmarkedQuestions(savedBookmarks);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user progress
  const fetchUserProgress = async () => {
    if (!user || !token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/progress/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const progressMap = {};
      response.data.forEach(progress => {
        progressMap[progress.question_id] = progress;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Toggle solved status
  const toggleSolved = async (questionId) => {
    if (!user || !token) return;
    try {
      const currentStatus = userProgress[questionId]?.is_solved || false;
      await axios.post(`${API_BASE_URL}/api/progress`, {
        userId: user.id,
        questionId: questionId,
        isSolved: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          question_id: questionId,
          is_solved: !currentStatus,
          solved_at: !currentStatus ? new Date().toISOString() : null
        }
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (questionId) => {
    const newBookmarks = {
      ...bookmarkedQuestions,
      [questionId]: !bookmarkedQuestions[questionId]
    };
    setBookmarkedQuestions(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchQuestions();
      await fetchUserProgress();
    };
    fetchAllData();
  }, [user, token]);

  // Filter only bookmarked questions
  const bookmarkedQuestionsList = questions.filter(question => 
    bookmarkedQuestions[question.id]
  );

  return (
    <div className="bookmarks-page max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <BookmarkIcon className="w-8 h-8 mr-3" />
          My Bookmarks
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your saved questions for quick access
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : bookmarkedQuestionsList.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <ClipboardDocumentListIcon className="w-24 h-24 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start bookmarking questions to build your collection!
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Browse Questions
          </a>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  {bookmarkedQuestionsList.length} bookmarked questions
                </span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {bookmarkedQuestionsList.filter(q => userProgress[q.id]?.is_solved).length} solved
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {bookmarkedQuestionsList.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isSolved={userProgress[question.id]?.is_solved || false}
                onToggleSolved={() => toggleSolved(question.id)}
                isBookmarked={bookmarkedQuestions[question.id] || false}
                onToggleBookmark={() => toggleBookmark(question.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
