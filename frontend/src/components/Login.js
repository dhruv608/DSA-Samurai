import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ComputerDesktopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/config';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      const { accessToken, refreshToken, user } = response.data;
      login(user, accessToken, refreshToken);
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

            <div className="form-group">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">Remember me for 30 days</span>
              </label>
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
