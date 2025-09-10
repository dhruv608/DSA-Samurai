import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import UserHeader from './components/UserHeader';
import AdminHeader from './components/AdminHeader';
import UserHomePage from './pages/UserHomePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BookmarksPage from './pages/BookmarksPage';
// import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import AdminDashboard from './pages/AdminDashboard';
import UsersPage from './pages/UsersPage';
import ProgressPage from './pages/ProgressPage';

// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { user } = useContext(AuthContext);
  
//   if (!user) {
//     return <Login />;
//   }
  
//   if (requiredRole && user.role !== requiredRole) {
//     return <Navigate to="/" replace />;
//   }
  
//   return children;
// };

function AppContent() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <Routes>
        {/* User Routes */}
        {user.role === 'user' && (
          <>
            <Route path="/*" element={
              <>
                <UserHeader />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<UserHomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/bookmarks" element={<BookmarksPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </>
            } />
          </>
        )}
        
        {/* Admin Routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/*" element={
              <>
                <AdminHeader />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/progress" element={<ProgressPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </>
            } />
          </>
        )}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
