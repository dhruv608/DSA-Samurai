import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ComputerDesktopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData);
      const { token, user } = response.data;
      login(user, token);
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-particles"></div>
        <div className="login-gradient"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-circle">
                <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="login-title">DSA Master</h1>
            <p className="login-subtitle">Sign in to track your progress</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                {error}
              </div>
            )}
            
            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="login-input"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="btn-icon"></span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p> Secure •  Fast •  Modern</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
