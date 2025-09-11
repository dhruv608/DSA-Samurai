import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
  PieChart,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const DashboardPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch questions and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsResponse, progressResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/questions`),
          axios.get(`${API_BASE_URL}/api/users/${user.id}/progress`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);
        
        console.log('📊 Dashboard - Questions data:', questionsResponse.data.length, 'questions');
        console.log('📊 Dashboard - Progress data:', progressResponse.data.length, 'progress records');
        
        setQuestions(questionsResponse.data);
        
        // Convert progress array to object for easier lookup
        const progressMap = {};
        progressResponse.data.forEach(p => {
          progressMap[String(p.question_id)] = p.is_solved;
          if (p.is_solved) {
            console.log('✅ Dashboard - Question', p.question_id, 'is solved');
          }
        });
        
        console.log('📈 Dashboard - Progress map:', progressMap);
        console.log('🎯 Dashboard - Solved count:', Object.values(progressMap).filter(Boolean).length);
        
        setUserProgress(progressMap);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);

  // Function to refresh data manually
  const refreshData = async () => {
    if (!user || !accessToken) return;
    
    try {
      setLoading(true);
      const [questionsResponse, progressResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/questions`),
        axios.get(`${API_BASE_URL}/api/users/${user.id}/progress`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);
      
      console.log('🔄 Dashboard Refresh - Questions data:', questionsResponse.data.length, 'questions');
      console.log('🔄 Dashboard Refresh - Progress data:', progressResponse.data.length, 'progress records');
      
      setQuestions(questionsResponse.data);
      
      // Convert progress array to object for easier lookup
      const progressMap = {};
      progressResponse.data.forEach(p => {
        progressMap[String(p.question_id)] = p.is_solved;
        if (p.is_solved) {
          console.log('✅ Dashboard Refresh - Question', p.question_id, 'is solved');
        }
      });
      
      console.log('📈 Dashboard Refresh - Progress map:', progressMap);
      console.log('🎯 Dashboard Refresh - Solved count:', Object.values(progressMap).filter(Boolean).length);
      
      setUserProgress(progressMap);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const getStats = () => {
    const total = questions.length;
    const solved = Object.values(userProgress).filter(Boolean).length;
    const unsolved = total - solved;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    
    const solvedByDifficulty = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    questions.forEach(q => {
      if (userProgress[String(q.id)]) {
        solvedByDifficulty[q.difficulty]++;
      }
    });

    return { total, solved, unsolved, percentage, solvedByDifficulty };
  };

  const stats = getStats();

  // Enhanced pie chart data with beautiful gradients
  const pieChartData = {
    labels: ['Solved', 'Pending'],
    datasets: [
      {
        data: [stats.solved, stats.unsolved],
        backgroundColor: [
          'rgba(16, 185, 129, 0.9)', // Emerald green for solved
          'rgba(251, 191, 36, 0.9)', // Amber for pending
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        borderWidth: 4,
        hoverBorderWidth: 6,
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        hoverBorderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        hoverOffset: 15,
        cutout: '60%',
      },
    ],
  };

  // Enhanced bar chart data with modern gradient colors
  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Solved Questions',
        data: [stats.solvedByDifficulty.easy, stats.solvedByDifficulty.medium, stats.solvedByDifficulty.hard],
        backgroundColor: [
          'rgba(34, 197, 94, 0.9)', // Vibrant green for easy
          'rgba(251, 191, 36, 0.9)', // Golden yellow for medium
          'rgba(239, 68, 68, 0.9)', // Vibrant red for hard
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        hoverBorderWidth: 4,
        hoverBorderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 25,
          font: {
            size: 14,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#374151',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} questions (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2500,
      easing: 'easeOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            return `${context[0].label} Difficulty`;
          },
          label: function(context) {
            return `Solved: ${context.parsed.y} questions`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: '500',
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#6B7280'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#374151'
        },
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 2500,
      easing: 'easeOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 200 + context.datasetIndex * 100;
        }
        return delay;
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };


  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Hero Stats Section */}
        <div className="hero-stats-section">
          <div className="hero-stats-grid">
            <div className="hero-stat-card hero-stat-solved group">
              <div className="hero-stat-icon">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="hero-stat-content">
                <div className="hero-stat-number">{stats.solved}</div>
                <div className="hero-stat-label">Solved</div>
                <div className="hero-stat-subtitle">Questions completed</div>
              </div>
            </div>
            
            <div className="hero-stat-card hero-stat-pending group">
              <div className="hero-stat-icon">
                <Clock className="w-7 h-7" />
              </div>
              <div className="hero-stat-content">
                <div className="hero-stat-number">{stats.unsolved}</div>
                <div className="hero-stat-label">Pending</div>
                <div className="hero-stat-subtitle">Questions remaining</div>
              </div>
            </div>
            
            <div className="hero-stat-card hero-stat-progress group">
              <div className="hero-stat-icon">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="hero-stat-content">
                <div className="hero-stat-number">{stats.percentage}%</div>
                <div className="hero-stat-label">Progress</div>
                <div className="hero-stat-subtitle">Completion rate</div>
              </div>
            </div>
            
            <div className="hero-stat-card hero-stat-total group">
              <div className="hero-stat-icon">
                <PieChart className="w-7 h-7" />
              </div>
              <div className="hero-stat-content">
                <div className="hero-stat-number">{stats.total}</div>
                <div className="hero-stat-label">Total</div>
                <div className="hero-stat-subtitle">Questions available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview Section */}
        <div className="progress-overview-section">
          <div className="progress-overview-card">
            <div className="progress-overview-header">
              <div className="progress-overview-title">
                <Activity className="w-6 h-6" />
                <span>Progress Overview</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <div className="progress-overview-percentage">{stats.percentage}%</div>
              </div>
            </div>
            <div className="progress-overview-bar">
              <div 
                className="progress-overview-fill" 
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <div className="progress-overview-stats">
              <span className="progress-overview-text">
                {stats.solved} of {stats.total} questions completed
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <div className="analytics-header">
            <h2 className="analytics-title">
              <BarChart3 className="w-6 h-6" />
              Analytics & Insights
            </h2>
            <p className="analytics-subtitle">Detailed breakdown of your performance</p>
          </div>
          
          <div className="analytics-grid">
            <div className="analytics-card group">
              <div className="analytics-card-header">
                <div className="analytics-card-title">
                  <PieChart className="w-5 h-5" />
                  <span>Overall Progress</span>
                </div>
                <div className="analytics-card-subtitle">Solved vs Pending</div>
              </div>
              <div className="analytics-chart">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="analytics-card group">
              <div className="analytics-card-header">
                <div className="analytics-card-title">
                  <BarChart3 className="w-5 h-5" />
                  <span>Difficulty Breakdown</span>
                </div>
                <div className="analytics-card-subtitle">Questions by difficulty level</div>
              </div>
              <div className="analytics-chart">
                <Bar data={difficultyChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
