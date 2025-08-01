import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  UserIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  LinkIcon,
  ArrowRightStartOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/users/${user.id}`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/users/${user.id}`, {
        fullName: profileData.full_name,
        leetcodeUsername: profileData.leetcode_username,
        geeksforgeeksUsername: profileData.geeksforgeeks_username
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Re-fetch profile to discard changes
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/users/${user.id}`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to reload profile data');
      }
    };
    fetchProfile();
    setIsEditing(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profileData) {
    return <div>No profile data found.</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1><UserIcon className="inline-block w-6 h-6 mr-2" />Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-form">
            <div className="form-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="inline-block w-4 h-4 mr-1" />Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                  >
                    <CheckIcon className="inline-block w-4 h-4 mr-1" />Save
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    <XMarkIcon className="inline-block w-4 h-4 mr-1" />Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="form-fields">
                <div className="field-group">
                    <label htmlFor="username">Username:</label>
                    <span className="field-value">{profileData.username}</span>
                </div>

                <div className="field-group">
                    <label htmlFor="fullName">Full Name:</label>
                    {isEditing ? (
                    <input
                        type="text"
                        id="fullName"
                        name="full_name"
                        value={profileData.full_name || ''}
                        onChange={handleInputChange}
                        className="profile-input"
                    />
                    ) : (
                    <span className="field-value">{profileData.full_name}</span>
                    )}
              </div>

              <div className="field-group">
                <label htmlFor="leetcode_username">LeetCode ID:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="leetcode_username"
                    name="leetcode_username"
                    value={profileData.leetcode_username || ''}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                ) : (
                  <div className="field-with-link">
                    <span className="field-value">{profileData.leetcode_username}</span>
                    {profileData.leetcode_username && (
                      <a 
                        href={`https://leetcode.com/${profileData.leetcode_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platform-link"
                      >
                        <LinkIcon className="inline-block w-4 h-4 mr-1" />Visit LeetCode
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="geeksforgeeks_username">GeeksforGeeks ID:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="geeksforgeeks_username"
                    name="geeksforgeeks_username"
                    value={profileData.geeksforgeeks_username || ''}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                ) : (
                  <div className="field-with-link">
                    <span className="field-value">{profileData.geeksforgeeks_username}</span>
                    {profileData.geeksforgeeks_username && (
                      <a 
                        href={`https://auth.geeksforgeeks.org/user/${profileData.geeksforgeeks_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platform-link"
                      >
                        <LinkIcon className="inline-block w-4 h-4 mr-1" />Visit GFG
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="logout-section">
            <div className="logout-container">
              <div className="logout-header">
                <h3>Account Actions</h3>
                <p>Need to switch accounts or take a break?</p>
              </div>
              <div className="logout-button-wrapper">
                <button 
                  onClick={logout}
                  className="logout-btn"
                >
                  <ArrowRightStartOnRectangleIcon className="inline-block w-4 h-4 mr-1" />Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
