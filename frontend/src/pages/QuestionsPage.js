import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import QuestionList from '../components/QuestionList';
import EditModal from '../components/EditModal';
import SearchAndFilter from '../components/SearchAndFilter';

const API_BASE_URL = 'http://localhost:3001';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('homework');
  const [filterDifficulty, setFilterDifficulty] = useState('easy');

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

  // Update question
  const updateQuestion = async (id, questionData) => {
    try {
      await axios.put(`${API_BASE_URL}/questions/${id}`, questionData);
      showMessage('Question updated successfully!', 'success');
      fetchQuestions();
      setEditingQuestion(null);
    } catch (error) {
      showMessage('Failed to update question', 'error');
      console.error('Error updating question:', error);
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
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filterType, filterDifficulty]);

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
    <div className="page-container">
      <div className="questions-header">
        <h1>
          <ClipboardDocumentListIcon className="inline-block w-8 h-8 mr-2" />
          All Questions
        </h1>
        <p className="page-description">
          Use filters to manage and browse the collection of coding questions
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card-small total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card-small homework">
          <div className="stat-number">{stats.homework}</div>
          <div className="stat-label">Homework</div>
        </div>
        <div className="stat-card-small classwork">
          <div className="stat-number">{stats.classwork}</div>
          <div className="stat-label">Classwork</div>
        </div>
        <div className="stat-card-small easy">
          <div className="stat-number">{stats.easy}</div>
          <div className="stat-label">Easy</div>
        </div>
        <div className="stat-card-small medium">
          <div className="stat-number">{stats.medium}</div>
          <div className="stat-label">Medium</div>
        </div>
        <div className="stat-card-small hard">
          <div className="stat-number">{stats.hard}</div>
          <div className="stat-label">Hard</div>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterDifficulty={filterDifficulty}
        setFilterDifficulty={setFilterDifficulty}
        totalResults={filteredQuestions.length}
      />

      {/* Questions List */}
      <QuestionList
        questions={filteredQuestions}
        loading={loading}
        onEdit={setEditingQuestion}
        onDelete={deleteQuestion}
      />

      {/* Edit Modal */}
      {editingQuestion && (
        <EditModal
          question={editingQuestion}
          onUpdate={updateQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

export default QuestionsPage;
