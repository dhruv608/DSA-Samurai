import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  RocketLaunchIcon,
  Square3Stack3DIcon,
  LinkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  TreePineIcon,
  BarChart3Icon,
  GitBranchIcon
} from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import FilterTabs from '../components/FilterTabs';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const UserHomePage = () => {
  const { user, token } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [solvedFilter, setSolvedFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('latest'); // Add sort filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});

  // Get bookmarked questions from local storage
  const getBookmarkedQuestions = useCallback(() => {
    if (!user?.id) return {};
    const saved = localStorage.getItem(`bookmarks_${user.id}`);
    return saved ? JSON.parse(saved) : {};
  }, [user?.id]);

  // Fetch all questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/questions`);
      setQuestions(response.data);
      setFilteredQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
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
  }, [user, token]);

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

  // Get date filter options
  const getDateFilteredQuestions = useCallback((questions) => {
    if (dateFilter === 'all') return questions;

    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return questions;
    }

    return questions.filter(question => {
      const questionDate = new Date(question.created_at);
      return questionDate >= filterDate;
    });
  }, [dateFilter]);

  // Filter and sort questions based on search and filters
  useEffect(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.question_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeFilter === 'all' || question.type === activeFilter;
      const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;

      const isSolved = userProgress[question.id]?.is_solved || false;
      const matchesSolved = solvedFilter === 'all' ||
        (solvedFilter === 'solved' && isSolved) ||
        (solvedFilter === 'unsolved' && !isSolved);

      return matchesSearch && matchesType && matchesDifficulty && matchesSolved;
    });

    filtered = getDateFilteredQuestions(filtered);
    
    // Sort questions based on sortFilter
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (sortFilter === 'latest') {
        return dateB - dateA; // Newest first (descending)
      } else if (sortFilter === 'oldest') {
        return dateA - dateB; // Oldest first (ascending)
      }
      return 0;
    });
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, activeFilter, difficultyFilter, solvedFilter, dateFilter, sortFilter, userProgress, getDateFilteredQuestions]);

  // Load questions and progress on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      await fetchQuestions();
      await fetchUserProgress();
      // Load bookmarks from localStorage
      if (user?.id) {
        const savedBookmarks = getBookmarkedQuestions();
        setBookmarkedQuestions(savedBookmarks);
      }
    };
    fetchAllData();
  }, [user, token, fetchQuestions, fetchUserProgress, getBookmarkedQuestions]);

  // Get statistics
  const getStats = () => {
    const total = questions.length;
    const homework = questions.filter(q => q.type === 'homework').length;
    const classwork = questions.filter(q => q.type === 'classwork').length;
    const easy = questions.filter(q => q.difficulty === 'easy').length;
    const medium = questions.filter(q => q.difficulty === 'medium').length;
    const hard = questions.filter(q => q.difficulty === 'hard').length;

    return { total, homework, classwork, easy, medium, hard };
  };

  const stats = getStats();
  const itemsPerPage = 10;

  // Save bookmarks to local storage
  const saveBookmarks = (bookmarks) => {
    if (!user?.id) return;
    localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(bookmarks));
  };

  const toggleBookmark = (questionId) => {
    const newBookmarks = {
      ...bookmarkedQuestions,
      [questionId]: !bookmarkedQuestions[questionId]
    };
    setBookmarkedQuestions(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  const paginate = (questions) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return questions.slice(startIndex, endIndex);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < filteredQuestions.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="user-home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Your <span className="highlight">Coding Skills</span>
          </h1>
          <p className="hero-description">
            Code like a <span className="highlight">Samurai</span> — stay sharp, solve daily, and track every step of your DSA journey
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Questions</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Difficulty Levels</span>
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="dsa-visualization">
            <div className="dsa-title">Data Structures & Algorithms</div>
            <div className="dsa-items">
              <div className="dsa-item">
                <div className="dsa-icon"><TreePineIcon className="w-8 h-8" /></div>
                <div className="dsa-name">Trees</div>
              </div>
              <div className="dsa-item">
                <div className="dsa-icon"><BarChart3Icon className="w-8 h-8" /></div>
                <div className="dsa-name">Arrays</div>
              </div>
              <div className="dsa-item">
                <div className="dsa-icon"><LinkIcon className="w-8 h-8" /></div>
                <div className="dsa-name">Linked Lists</div>
              </div>
              <div className="dsa-item">
                <div className="dsa-icon"><Square3Stack3DIcon className="w-8 h-8" /></div>
                <div className="dsa-name">Stacks</div>
              </div>
              <div className="dsa-item">
                <div className="dsa-icon"><GitBranchIcon className="w-8 h-8" /></div>
                <div className="dsa-name">Graphs</div>
              </div>
              <div className="dsa-item">
                <div className="dsa-icon"><BoltIcon className="w-8 h-8" /></div>
                <div className="dsa-name">Sorting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-user pl-10"
            />
          </div>
          <FilterTabs
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            stats={stats}
          />

          <div className="additional-filters">
            <div className="filter-group">
              <label>Date Added:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {user && (
              <div className="filter-group">
                <label>Progress:</label>
                <select
                  value={solvedFilter}
                  onChange={(e) => setSolvedFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Questions</option>
                  <option value="solved">Solved</option>
                  <option value="unsolved">Unsolved</option>
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="filter-select"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="questions-section">
        <div className="questions-container">
          <div className="section-header">
            <h2 className="section-title">
              {activeFilter === 'all'
                ? 'All Questions'
                : activeFilter === 'homework'
                  ? 'Homework Questions'
                  : 'Classwork Questions'}
            </h2>
            <div className="results-count">
              {filteredQuestions.length} questions
            </div>
          </div>

          {loading ? (
            <div className="questions-grid-horizontal">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="question-card-skeleton">
                  <div className="skeleton-header"></div>
                  <div className="skeleton-content"></div>
                  <div className="skeleton-footer"></div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="no-questions">
              <div className="no-questions-icon"></div>
              <h3>No questions found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {paginate(filteredQuestions).map((question) => (
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
          )}

          {/* Pagination controls */}
          {filteredQuestions.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">
                  Page <span className="text-blue-600 font-bold">{currentPage}</span> of <span className="text-blue-600 font-bold">{Math.ceil(filteredQuestions.length / itemsPerPage)}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}
                </span>
              </div>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                onClick={handleNextPage}
                disabled={currentPage * itemsPerPage >= filteredQuestions.length}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="user-footer">
        <div className="footer-content">
          <p className="flex items-center justify-center">
            &copy; 2025 DSA Samurai. Keep practicing and keep growing! 
            <RocketLaunchIcon className="inline-block w-5 h-5 ml-1" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserHomePage;
