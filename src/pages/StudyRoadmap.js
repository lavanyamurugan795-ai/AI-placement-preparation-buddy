import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStudyRoadmap } from '../services/geminiService';
import './StudyRoadmap.css';

const StudyRoadmap = () => {
  const [targetCompanies, setTargetCompanies] = useState('');
  const [timeframe, setTimeframe] = useState('3 months');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateRoadmap = async () => {
    if (!targetCompanies.trim()) {
      alert('Please enter at least one target company!');
      return;
    }

    setLoading(true);
    try {
      const companies = targetCompanies.split(',').map(c => c.trim());
      const response = await generateStudyRoadmap(companies, timeframe, currentLevel);
      setRoadmap(response);
    } catch (error) {
      alert('Failed to generate roadmap. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h2>🗺️ Personalized Study Roadmap</h2>
        <div></div>
      </div>

      <div className="roadmap-content">
        <div className="roadmap-form">
          <h3>Create Your Preparation Plan</h3>

          <div className="form-group">
            <label>Target Companies (comma-separated)</label>
            <input
              type="text"
              value={targetCompanies}
              onChange={(e) => setTargetCompanies(e.target.value)}
              placeholder="e.g., Google, Amazon, Microsoft, Meta"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preparation Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Skill Level</label>
              <select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button onClick={generateRoadmap} disabled={loading} className="btn-generate-roadmap">
            {loading ? 'Generating Your Roadmap...' : 'Generate Roadmap 🚀'}
          </button>
        </div>

        {roadmap && (
          <div className="roadmap-result">
            <div className="roadmap-header-section">
              <h3>Your Personalized Roadmap</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(roadmap)}
                className="btn-copy-roadmap"
              >
                📋 Copy Roadmap
              </button>
            </div>
            <div className="roadmap-display">
              {roadmap}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoadmap;