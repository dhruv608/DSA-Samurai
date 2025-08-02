import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  WrenchScrewdriverIcon,
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  LinkIcon,
  ClockIcon,
  InboxIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:3001';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [sortFilter, setSortFilter] = useState('latest'); // Add sort filter
  const [showQuestions, setShowQuestions] = useState(false);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    questionName: '',
    questionLink: '',
    type: 'homework',
    difficulty: 'easy'
  });

  // Fetch all questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/questions`);
      setQuestions(response.data);
      setFilteredQuestions(response.data);
    } catch (error) {
      showMessage('Failed to fetch questions', 'error');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Show message to user
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Handle new question form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new question
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/submit-question`, newQuestion);
      showMessage('Question added successfully!', 'success');
      setNewQuestion({
        questionName: '',
        questionLink: '',
        type: 'homework',
        difficulty: 'easy'
      });
      fetchQuestions();
    } catch (error) {
      showMessage('Failed to add question', 'error');
      console.error('Error adding question:', error);
    }
  };

  // Delete question
  const deleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${API_BASE_URL}/questions/${id}`);
        showMessage('Question deleted successfully!', 'success');
        fetchQuestions();
      } catch (error) {
        showMessage('Failed to delete question', 'error');
        console.error('Error deleting question:', error);
      }
    }
  };

  // Filter and search questions
  useEffect(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.question_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === '' || question.type === filterType;
      const matchesDifficulty = filterDifficulty === '' || question.difficulty === filterDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    });
    
    // Sort questions
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (sortFilter === 'latest') {
        return dateB - dateA; // Newest first
      } else if (sortFilter === 'oldest') {
        return dateA - dateB; // Oldest first
      }
      return 0;
    });
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filterType, filterDifficulty, sortFilter]);

  // Load questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>
          <WrenchScrewdriverIcon className="inline-block w-8 h-8 mr-2" />
          Admin Dashboard
        </h1>
        <p>Manage coding questions and monitor platform activity</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><ChartBarIcon className="w-8 h-8" /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Questions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BookOpenIcon className="w-8 h-8" /></div>
          <div className="stat-content">
            <h3>{stats.homework}</h3>
            <p>Homework</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AcademicCapIcon className="w-8 h-8" /></div>
          <div className="stat-content">
            <h3>{stats.classwork}</h3>
            <p>Classwork</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><div className="w-4 h-4 bg-green-500 rounded-full"></div></div>
          <div className="stat-content">
            <h3>{stats.easy}</h3>
            <p>Easy</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><div className="w-4 h-4 bg-yellow-500 rounded-full"></div></div>
          <div className="stat-content">
            <h3>{stats.medium}</h3>
            <p>Medium</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><div className="w-4 h-4 bg-red-500 rounded-full"></div></div>
          <div className="stat-content">
            <h3>{stats.hard}</h3>
            <p>Hard</p>
          </div>
        </div>
      </div>

      {/* Add New Question Form */}
      <div className="admin-section">
        <div className="section-header flex justify-center">
          <h2 className="flex items-center">
            <PlusIcon className="inline-block w-6 h-6 mr-2" />
            Add New Question
          </h2>
        </div>
        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="question-form max-w-4xl w-full">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="questionName">Question Name</label>
              <input
                type="text"
                id="questionName"
                name="questionName"
                value={newQuestion.questionName}
                onChange={handleInputChange}
                placeholder="Enter question name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="questionLink">Question Link</label>
              <input
                type="url"
                id="questionLink"
                name="questionLink"
                value={newQuestion.questionLink}
                onChange={handleInputChange}
                placeholder="https://example.com/question"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={newQuestion.type}
                onChange={handleInputChange}
                required
              >
                <option value="homework">Homework</option>
                <option value="classwork">Classwork</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={newQuestion.difficulty}
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
            <div className="flex justify-center">
              <button type="submit" className="submit-btn max-w-xs">
                <PlusIcon className="inline-block w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Questions Management */}
      <div className="admin-section">
        <div className="section-header flex justify-center">
          <h2 className="flex items-center">
            <ClipboardDocumentListIcon className="inline-block w-6 h-6 mr-2" />
            Manage Questions
          </h2>
          <button 
            className="toggle-btn"
            onClick={() => setShowQuestions(!showQuestions)}
          >
            <EyeIcon className="inline-block w-5 h-5 mr-1" />
            {showQuestions ? 'Hide Questions' : 'Show Questions'}
          </button>
        </div>

        {showQuestions && (
          <>
            {/* Search and Filter */}
            <div className="search-filter-section">
              <div className="search-bar relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input pl-10"
                />
              </div>
              
              <div className="filter-controls flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="homework">Homework</option>
                    <option value="classwork">Classwork</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterDifficulty('');
                    setSortFilter('latest');
                  }}
                  className="clear-btn"
                >
                  <TrashIcon className="inline-block w-4 h-4 mr-1" />
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="loading-message">
                <ClockIcon className="inline-block w-5 h-5 mr-2" />
                Loading questions...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="no-questions-message">
                <InboxIcon className="inline-block w-8 h-8 mr-2" />
                No questions found matching your criteria
              </div>
            ) : (
              <div className="questions-table-container">
                <table className="questions-table">
                  <thead>
                    <tr>
                      <th>Question Name</th>
                      <th>Type</th>
                      <th>Difficulty</th>
                      <th>Link</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map(question => (
                      <tr key={question.id}>
                        <td>{question.question_name}</td>
                        <td>
                          <span className={`type-badge type-${question.type}`}>
                            {question.type === 'homework' ? (
                              <BookOpenIcon className="inline-block w-4 h-4 mr-1" />
                            ) : (
                              <AcademicCapIcon className="inline-block w-4 h-4 mr-1" />
                            )}
                            {question.type}
                          </span>
                        </td>
                        <td>
                          <span className={`difficulty-badge difficulty-${question.difficulty}`}>
                            <div className={`inline-block w-3 h-3 rounded-full mr-2 ${
                              question.difficulty === 'easy' ? 'bg-green-500' :
                              question.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            {question.difficulty}
                          </span>
                        </td>
                        <td>
                          <a
                            href={question.question_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-btn"
                          >
                            <LinkIcon className="inline-block w-4 h-4 mr-1" />
                            Open
                          </a>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="delete-btn"
                            title="Delete Question"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
