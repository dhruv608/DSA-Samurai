import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
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
  BookOpen,
  BarChart3,
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
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch questions and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsRes, progressRes] = await Promise.all([
          axios.get('http://localhost:3001/questions'),
          axios.get(`http://localhost:3001/api/progress/${user.id}`)
        ]);
        
        setQuestions(questionsRes.data);
        
        // Convert progress array to object for easier lookup
        const progressMap = {};
        progressRes.data.forEach(p => {
          progressMap[p.question_id] = p.is_solved;
        });
        setUserProgress(progressMap);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);





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
      if (userProgress[q.id]) {
        solvedByDifficulty[q.difficulty]++;
      }
    });

    return { total, solved, unsolved, percentage, solvedByDifficulty };
  };

  const stats = getStats();

  // Pie chart data for overall progress with theme colors only
  const pieChartData = {
    labels: ['Solved', 'Pending'],
    datasets: [
      {
        data: [stats.solved, stats.unsolved],
        backgroundColor: [
          '#1b3a69', // Primary blue for solved
          '#93c5fd', // Light blue for pending
        ],
        borderColor: [
          '#1e40af',
          '#3b82f6',
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  };

  // Bar chart data for difficulty breakdown with theme colors
  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Solved Questions',
        data: [stats.solvedByDifficulty.easy, stats.solvedByDifficulty.medium, stats.solvedByDifficulty.hard],
        backgroundColor: [
          '#1b3a69', // Primary blue
          '#3b82f6', // Light blue
          '#1e40af', // Dark blue
        ],
        borderColor: [
          '#1e40af',
          '#1b3a69',
          '#1e3a8a',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"><PieChart className="w-16 h-16 text-blue-600" /></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="flex items-center justify-center gap-3">
            <PieChart className="w-12 h-12" />
            Your Dashboard
          </h1>
          <p>Track your coding progress and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card solved">
            <div className="stat-icon">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.solved}</div>
              <div className="stat-label">Solved</div>
            </div>
          </div>
          
          <div className="stat-card unsolved">
            <div className="stat-icon">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.unsolved}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card percentage">
            <div className="stat-icon">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.percentage}%</div>
              <div className="stat-label">Progress</div>
            </div>
          </div>
          
          <div className="stat-card total">
            <div className="stat-icon">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-card">
              <h3 className="flex items-center justify-center gap-2">
                <PieChart className="w-6 h-6" />
                Overall Progress
              </h3>
              <div className="chart-wrapper">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card">
              <h3 className="flex items-center justify-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Progress by Difficulty
              </h3>
              <div className="chart-wrapper">
                <Bar data={difficultyChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <h2 className="flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Progress Overview
          </h2>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{stats.solved} of {stats.total} completed ({stats.percentage}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
