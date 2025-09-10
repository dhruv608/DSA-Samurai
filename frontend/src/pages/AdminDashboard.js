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
  UsersIcon,
  UserPlusIcon,
  PencilIcon,
  TrophyIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeSlashIcon,
  CogIcon,
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

  // User Management State
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Progress Tracking State
  const [progressStats, setProgressStats] = useState({});
  const [showProgressSection, setShowProgressSection] = useState(false);
  const [syncingProgress, setSyncingProgress] = useState(false);

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    questionName: '',
    questionLink: '',
    type: 'homework',
    difficulty: 'easy'
  });

  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    password: '',
    leetcodeUsername: '',
    geeksforgeeksUsername: ''
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

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/debug/users`);
      setUsers(response.data.users || response.data);
      setFilteredUsers(response.data.users || response.data);
    } catch (error) {
      showMessage('Failed to fetch users', 'error');
      console.error('Error fetching users:', error);
    }
  }, []);

  // Fetch user progress for a specific user
  const fetchUserProgress = async (userId) => {
    try {
      const progressResponse = await axios.get(`${API_BASE_URL}/api/progress/${userId}`);
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      
      setUserProgress(progressResponse.data);
      setSelectedUser(userResponse.data);
      setShowProgressModal(true);
    } catch (error) {
      showMessage('Failed to fetch user progress', 'error');
      console.error('Error fetching user progress:', error);
    }
  };

  // Fetch progress statistics
  const fetchProgressStats = useCallback(async () => {
    try {
      const leaderboardResponse = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      const stats = {};
      
      leaderboardResponse.data.forEach(user => {
        stats[user.id] = {
          solved_count: user.solved_count,
          success_rate: user.success_rate
        };
      });
      
      setProgressStats(stats);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  }, []);

  // Sync all users progress from GFG and LeetCode APIs
  const syncAllUsersProgress = async () => {
    if (window.confirm('This will sync progress for all users from GFG and LeetCode APIs. This may take a while. Continue?')) {
      setSyncingProgress(true);
      try {
        console.log('🔄 Starting sync for all users...');
        const response = await axios.post(`${API_BASE_URL}/api/sync-all-progress`);
        
        if (response.data.success) {
          const results = response.data.results;
          console.log(`✅ Sync completed!`, results);
          
          // Show success message with details
          const successCount = results.success?.length || 0;
          const profilesUpdated = results.profiles_updated || 0;
          const errors = results.errors?.length || 0;
          
          showMessage(
            `Sync completed! ${successCount} users synced, ${profilesUpdated} photos updated${errors > 0 ? `, ${errors} errors` : ''}`,
            'success'
          );
          
          // Refresh data
          await fetchUsers();
          await fetchProgressStats();
        } else {
          showMessage('Sync completed with some errors', 'error');
        }
      } catch (error) {
        console.error('❌ Failed to sync users progress:', error);
        showMessage('Failed to sync users progress. Please try again.', 'error');
      } finally {
        setSyncingProgress(false);
      }
    }
  };

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

      {/* User Management */}
      <div className="admin-section">
        <div className="section-header flex justify-center">
          <h2 className="flex items-center">
            <UsersIcon className="inline-block w-6 h-6 mr-2" />
            User Management
          </h2>
          <div className="flex gap-2">
            <button 
              className="add-btn"
              onClick={() => setShowAddUserModal(true)}
            >
              <UserPlusIcon className="inline-block w-5 h-5 mr-1" />
              Add User
            </button>
            <button 
              className="toggle-btn"
              onClick={() => {
                setShowUsers(!showUsers);
                if (!showUsers && users.length === 0) {
                  fetchUsers();
                }
              }}
            >
              <EyeIcon className="inline-block w-5 h-5 mr-1" />
              {showUsers ? 'Hide Users' : 'Show Users'}
            </button>
            <button 
              className="sync-btn"
              onClick={syncAllUsersProgress}
              disabled={syncingProgress}
              title="Sync all users progress from GFG and LeetCode APIs"
            >
              {syncingProgress ? (
                <ClockIcon className="inline-block w-5 h-5 mr-1 animate-spin" />
              ) : (
                <ChartBarIcon className="inline-block w-5 h-5 mr-1" />
              )}
              {syncingProgress ? 'Syncing...' : 'Sync Progress'}
            </button>
          </div>
        </div>

        {showUsers && (
          <>
            {/* User Search */}
            <div className="search-filter-section">
              <div className="search-bar relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    const filtered = users.filter(user => 
                      user.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      (user.full_name && user.full_name.toLowerCase().includes(e.target.value.toLowerCase()))
                    );
                    setFilteredUsers(filtered);
                  }}
                  className="search-input pl-10"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="questions-table-container">
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>LeetCode</th>
                    <th>GeeksforGeeks</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(user => user.role === 'user').map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.full_name || 'Not set'}</td>
                      <td>{user.leetcode_username || 'Not set'}</td>
                      <td>{user.geeksforgeeks_username || 'Not set'}</td>
                      <td>
                        <span className="text-blue-600 font-semibold">
                          {progressStats[user.id]?.solved_count || 0} solved
                          <span className="text-gray-500 text-sm ml-1">
                            ({progressStats[user.id]?.success_rate || 0}%)
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fetchUserProgress(user.id)}
                            className="view-btn"
                            title="View Progress"
                          >
                            <TrophyIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditUserModal(true);
                            }}
                            className="edit-btn"
                            title="Edit User"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Progress Tracking */}
      <div className="admin-section">
        <div className="section-header flex justify-center">
          <h2 className="flex items-center">
            <TrophyIcon className="inline-block w-6 h-6 mr-2" />
            Progress Overview
          </h2>
          <div className="flex gap-2">
            <button 
              className="sync-btn"
              onClick={syncAllUsersProgress}
              disabled={syncingProgress}
              title="Sync all users progress from GFG and LeetCode APIs"
            >
              {syncingProgress ? (
                <ClockIcon className="inline-block w-5 h-5 mr-1 animate-spin" />
              ) : (
                <ChartBarIcon className="inline-block w-5 h-5 mr-1" />
              )}
              {syncingProgress ? 'Syncing...' : 'Sync Progress'}
            </button>
            <button 
              className="toggle-btn"
              onClick={() => {
                setShowProgressSection(!showProgressSection);
                if (!showProgressSection) {
                  fetchProgressStats();
                  fetchUsers();
                }
              }}
            >
              {showProgressSection ? <EyeSlashIcon className="inline-block w-5 h-5 mr-1" /> : <EyeIcon className="inline-block w-5 h-5 mr-1" />}
              {showProgressSection ? 'Hide Progress' : 'Show Progress'}
            </button>
          </div>
        </div>

        {showProgressSection && (
          <div className="progress-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><UsersIcon className="w-8 h-8" /></div>
                <div className="stat-content">
                  <h3>{users.filter(u => u.role === 'user').length}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><CheckCircleIcon className="w-8 h-8 text-green-600" /></div>
                <div className="stat-content">
                  <h3>{Object.values(progressStats).reduce((sum, stat) => sum + (stat.solved_count || 0), 0)}</h3>
                  <p>Total Questions Solved</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><TrophyIcon className="w-8 h-8 text-yellow-600" /></div>
                <div className="stat-content">
                  <h3>{Math.round(Object.values(progressStats).reduce((sum, stat, _, arr) => sum + (stat.success_rate || 0), 0) / Math.max(Object.keys(progressStats).length, 1) * 100) / 100}%</h3>
                  <p>Average Success Rate</p>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="top-performers mt-6">
              <h3 className="text-lg font-semibold mb-4 text-center">🏆 Top Performers</h3>
              <div className="questions-table-container">
                <table className="questions-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Questions Solved</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(progressStats)
                      .sort(([,a], [,b]) => (b.solved_count || 0) - (a.solved_count || 0))
                      .slice(0, 10)
                      .map(([userId, stats], index) => {
                        const user = users.find(u => u.id.toString() === userId);
                        return user ? (
                          <tr key={userId}>
                            <td>
                              <span className={`rank-badge ${
                                index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'
                              }`}>
                                #{index + 1}
                              </span>
                            </td>
                            <td>{user.full_name || user.username}</td>
                            <td className="text-center font-semibold">{stats.solved_count || 0}</td>
                            <td className="text-center">{stats.success_rate || 0}%</td>
                          </tr>
                        ) : null;
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
