import React from 'react';

const QuestionList = ({ questions, loading, onEdit, onDelete }) => {
  if (loading) {
    return <div className="loading-message">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div className="no-questions-message">No questions found.</div>;
  }

  return (
    <div className="question-list-container">
      <h2>All Questions</h2>
      <table className="question-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Link</th>
            <th>Type</th>
            <th>Difficulty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id}>
              <td>{q.question_name}</td>
              <td>
                <a href={q.question_link} target="_blank" rel="noopener noreferrer">
                  View Link
                </a>
              </td>
              <td className={`type-${q.type}`}>{q.type}</td>
              <td className={`difficulty-${q.difficulty}`}>{q.difficulty}</td>
              <td>
                <button 
                  className="edit-btn" 
                  onClick={() => onEdit(q)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => onDelete(q.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionList;
