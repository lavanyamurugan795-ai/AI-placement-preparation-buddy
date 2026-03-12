import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchUserDataAndUpdateStreak();
      generateProgressData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchUserDataAndUpdateStreak = async () => {
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        await updateStreak(data, docRef);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const updateStreak = async (data, docRef) => {
    const today = new Date().toDateString();
    const lastActive = data.lastActiveDate;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = data.streak || 0;

    if (lastActive === today) {
      newStreak = data.streak || 1;
    } else if (lastActive === yesterdayStr) {
      newStreak = (data.streak || 0) + 1;

      await setDoc(
        docRef,
        {
          streak: newStreak,
          lastActiveDate: today,
        },
        { merge: true }
      );
    } else {
      newStreak = 1;

      await setDoc(
        docRef,
        {
          streak: 1,
          lastActiveDate: today,
        },
        { merge: true }
      );
    }

    setStreak(newStreak);
  };

  const generateProgressData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      data.push({
        day: dayName,
        problems: Math.floor(Math.random() * 10),
        interviews: Math.floor(Math.random() * 3),
        topics: Math.floor(Math.random() * 5)
      });
    }
    
    setProgressData(data);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">🤖 AI Placement Buddy</div>

        <div className="nav-user">
          <span>Welcome, {userData?.name || "User"}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Your Placement Preparation Hub</h1>

        {/* STREAK BANNER */}
        {streak > 0 && (
          <div className="streak-banner">
            <div className="streak-flame">🔥</div>
            <div className="streak-content">
              <div className="streak-number">{streak}</div>
              <div className="streak-text">Day Streak!</div>
            </div>
            <div className="streak-message">
              {streak === 1 && "Great start! Come back tomorrow!"}
              {streak > 1 && streak < 7 && "Keep it up! You're building momentum!"}
              {streak >= 7 && streak < 30 && "Amazing! You're on fire! 🔥"}
              {streak >= 30 && "Legendary streak! You're unstoppable! 👑"}
            </div>
          </div>
        )}

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💻</div>
            <div className="stat-number">
              {userData?.progress?.problemsSolved || 0}
            </div>
            <div className="stat-label">Problems Solved</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎤</div>
            <div className="stat-number">
              {userData?.progress?.mockInterviewsTaken || 0}
            </div>
            <div className="stat-label">Mock Interviews</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-number">
              {userData?.progress?.topicsCompleted?.length || 0}
            </div>
            <div className="stat-label">Topics Completed</div>
          </div>

          <div className="stat-card streak-stat">
            <div className="stat-icon">🔥</div>
            <div className="stat-number">{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        {/* FEATURES GRID - ABOVE CHARTS */}
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate("/chat")}>
            <div className="feature-icon">💬</div>
            <h3>AI Chat Tutor</h3>
            <p>Ask anything about placements, DSA, or interviews</p>
          </div>

          <div
            className="feature-card"
            onClick={() => navigate("/mock-interview")}
          >
            <div className="feature-icon">🎤</div>
            <h3>Mock Interviews</h3>
            <p>Practice technical and HR interviews with AI</p>
          </div>

          <div
            className="feature-card"
            onClick={() => navigate("/dsa-practice")}
          >
            <div className="feature-icon">💻</div>
            <h3>DSA Problems</h3>
            <p>Solve coding problems with AI hints</p>
          </div>

          <div
            className="feature-card"
            onClick={() => navigate("/resume-builder")}
          >
            <div className="feature-icon">📄</div>
            <h3>Resume Builder</h3>
            <p>Create and analyze your resume</p>
          </div>

          <div
            className="feature-card"
            onClick={() => navigate("/study-roadmap")}
          >
            <div className="feature-icon">🗺️</div>
            <h3>Study Roadmap</h3>
            <p>Get personalized preparation plans</p>
          </div>

          <div
            className="feature-card"
            onClick={() => navigate("/company-prep")}
          >
            <div className="feature-icon">🏢</div>
            <h3>Company Prep</h3>
            <p>Preparation guides for top companies</p>
          </div>
        </div>

        {/* PROGRESS CHARTS - BELOW FEATURES */}
        <div className="progress-chart-section">
          <div className="chart-card">
            <h3>📈 Your Progress This Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#666"
                  style={{ fontSize: '14px', fontWeight: '500' }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '14px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '10px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="problems" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name="Problems Solved"
                  dot={{ fill: '#667eea', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#ff6b6b" 
                  strokeWidth={3}
                  name="Mock Interviews"
                  dot={{ fill: '#ff6b6b', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="topics" 
                  stroke="#4caf50" 
                  strokeWidth={3}
                  name="Topics Covered"
                  dot={{ fill: '#4caf50', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>📊 Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day"
                  stroke="#666"
                  style={{ fontSize: '14px', fontWeight: '500' }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '14px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '10px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar dataKey="problems" fill="#667eea" name="Problems" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interviews" fill="#ff6b6b" name="Interviews" radius={[8, 8, 0, 0]} />
                <Bar dataKey="topics" fill="#4caf50" name="Topics" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;