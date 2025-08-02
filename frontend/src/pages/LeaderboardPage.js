import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrophyIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  FireIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
} from '@heroicons/react/24/solid';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all-time');

  // Enhanced static demo data with more details
  const staticLeaderboardData = useMemo(() => ({
    'all-time': [
      { 
        id: 1, 
        username: 'nitin', 
        full_name: 'Nitin Verma', 
        solved_count: 45, 
        success_rate: 78.2, 
        rank: 1,
        total_attempts: 58,
        streak: 12,
        easy: 20,
        medium: 18,
        hard: 7
      },
      { 
        id: 2, 
        username: 'shivani', 
        full_name: 'Shivani Kapoor', 
        solved_count: 42, 
        success_rate: 75.5, 
        rank: 2,
        total_attempts: 56,
        streak: 8,
        easy: 18,
        medium: 16,
        hard: 8
      },
      { 
        id: 3, 
        username: 'shivam', 
        full_name: 'Shivam Tiwari', 
        solved_count: 38, 
        success_rate: 72.1, 
        rank: 3,
        total_attempts: 53,
        streak: 5,
        easy: 15,
        medium: 15,
        hard: 8
      },
      { id: 4, username: 'kajal', full_name: 'Kajal Deshmukh', solved_count: 35, success_rate: 68.9, rank: 4 },
      { id: 5, username: 'neha', full_name: 'Neha Agarwal', solved_count: 32, success_rate: 65.3, rank: 5 },
      { id: 6, username: 'muskan', full_name: 'Muskan Mehra', solved_count: 28, success_rate: 61.7, rank: 6 },
      { id: 7, username: 'ankit', full_name: 'Ankit Bhatt', solved_count: 25, success_rate: 58.4, rank: 7 },
      { id: 8, username: 'priya', full_name: 'Priya Joshi', solved_count: 22, success_rate: 55.2, rank: 8 },
      { id: 9, username: 'rohit', full_name: 'Rohit Singh', solved_count: 19, success_rate: 52.1, rank: 9 },
      { id: 10, username: 'sneha', full_name: 'Sneha Bansal', solved_count: 16, success_rate: 48.9, rank: 10 }
    ],
    'weekly': [
      { id: 1, username: 'dhruv', full_name: 'Dhruv Patel', solved_count: 12, success_rate: 85.7, rank: 1, streak: 5 },
      { id: 2, username: 'shivani', full_name: 'Shivani Kapoor', solved_count: 10, success_rate: 83.3, rank: 2, streak: 4 },
      { id: 3, username: 'shivam', full_name: 'Shivam Tiwari', solved_count: 8, success_rate: 80.0, rank: 3, streak: 3 },
      { id: 4, username: 'kajal', full_name: 'Kajal Deshmukh', solved_count: 7, success_rate: 77.8, rank: 4 },
      { id: 5, username: 'neha', full_name: 'Neha Agarwal', solved_count: 6, success_rate: 75.0, rank: 5 }
    ],
    'daily': [
      { id: 1, username: 'dhruv', full_name: 'Dhruv Patel', solved_count: 3, success_rate: 100.0, rank: 1, streak: 1 },
      { id: 2, username: 'shivani', full_name: 'Shivani Kapoor', solved_count: 2, success_rate: 100.0, rank: 2, streak: 1 },
      { id: 3, username: 'shivam', full_name: 'Shivam Tiwari', solved_count: 2, success_rate: 100.0, rank: 3, streak: 1 },
      { id: 4, username: 'kajal', full_name: 'Kajal Deshmukh', solved_count: 1, success_rate: 100.0, rank: 4 }
    ]
  }), []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLeaderboardData(staticLeaderboardData[filter] || []);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter, staticLeaderboardData]);

  const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (rank) => {
    const colors = {
      1: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      2: 'bg-gradient-to-br from-gray-300 to-gray-500',
      3: 'bg-gradient-to-br from-orange-400 to-orange-600'
    };
    return colors[rank] || 'bg-gradient-to-br from-blue-400 to-blue-600';
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const restOfUsers = leaderboardData.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrophyIconSolid className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Celebrating our coding champions</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg">
            {['daily', 'weekly', 'all-time'].map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === period
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {period === 'all-time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length >= 3 && (
          <div className="mb-16">
            {/* Winner (1st Place) - Larger and Centered */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-all duration-300">
                  {/* Crown */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 rounded-full p-3 shadow-lg">
                      <TrophyIconSolid className="w-8 h-8 text-yellow-700" />
                    </div>
                  </div>
                  
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-full ${getAvatarColor(1)} flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4`}>
                      {getAvatarInitials(topThree[0].full_name || topThree[0].username)}
                    </div>
                    
                    {/* User Info */}
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {topThree[0].full_name || topThree[0].username}
                    </h3>
                    <div className="text-yellow-600 font-semibold text-lg mb-4">🥇 Champion</div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{topThree[0].solved_count}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Problems Solved</div>
                      </div>
                      <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{topThree[0].success_rate}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
                      </div>
                    </div>

                    {/* Detailed breakdown for winner */}
                    {topThree[0].easy !== undefined && (
                      <div className="mt-4 w-full">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Problem Breakdown:</div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Easy: {topThree[0].easy}</span>
                          <span className="text-yellow-600">Medium: {topThree[0].medium}</span>
                          <span className="text-red-600">Hard: {topThree[0].hard}</span>
                        </div>
                        {topThree[0].streak && (
                          <div className="flex items-center justify-center mt-2 text-orange-600">
                            <FireIcon className="w-4 h-4 mr-1" />
                            <span className="text-sm">{topThree[0].streak} day streak</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2nd and 3rd Place Side by Side */}
            <div className="flex justify-center gap-8">
              {/* 2nd Place */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-gray-300 transform hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full ${getAvatarColor(2)} flex items-center justify-center text-white text-xl font-bold shadow-lg mb-3`}>
                    {getAvatarInitials(topThree[1].full_name || topThree[1].username)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {topThree[1].full_name || topThree[1].username}
                  </h3>
                  <div className="text-gray-500 font-semibold mb-3">🥈 Runner-up</div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{topThree[1].solved_count}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Solved</div>
                    </div>
                    <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{topThree[1].success_rate}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Success</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border-2 border-orange-300 transform hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full ${getAvatarColor(3)} flex items-center justify-center text-white text-xl font-bold shadow-lg mb-3`}>
                    {getAvatarInitials(topThree[2].full_name || topThree[2].username)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {topThree[2].full_name || topThree[2].username}
                  </h3>
                  <div className="text-orange-600 font-semibold mb-3">🥉 Third Place</div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{topThree[2].solved_count}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Solved</div>
                    </div>
                    <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{topThree[2].success_rate}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the Leaderboard */}
        {restOfUsers.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Other Competitors</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Problems Solved
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {restOfUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                              #{user.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold mr-4">
                              {getAvatarInitials(user.full_name || user.username)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.full_name || user.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.solved_count}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ChartBarIcon className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.success_rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {leaderboardData.length === 0 && (
          <div className="text-center py-16">
            <TrophyIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try selecting a different time period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
