import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume, generateResumeSection } from '../services/geminiService';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [sectionType, setSectionType] = useState('summary');
  const [userInfo, setUserInfo] = useState({
    experience: '',
    skills: '',
    targetRole: '',
    projectName: '',
    technologies: '',
    description: '',
    achievement: ''
  });
  const [generatedSection, setGeneratedSection] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyzeMyResume = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume first!');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeResume(resumeText);
      setAnalysis(response);
    } catch (error) {
      alert('Failed to analyze resume. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  const generateSection = async () => {
    setLoading(true);
    try {
      const response = await generateResumeSection(sectionType, userInfo);
      setGeneratedSection(response);
    } catch (error) {
      alert('Failed to generate section. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="resume-container">
      <div className="resume-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h2>📄 Resume Builder & Analyzer</h2>
        <div></div>
      </div>

      <div className="resume-content">
        <div className="tabs">
          <button 
            className={activeTab === 'analyze' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('analyze')}
          >
            Analyze Resume
          </button>
          <button 
            className={activeTab === 'build' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('build')}
          >
            Build Resume
          </button>
        </div>

        {activeTab === 'analyze' && (
          <div className="tab-content">
            <h3>Paste Your Resume for AI Analysis</h3>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your entire resume text here..."
              rows="12"
              className="resume-input"
            />
            <button onClick={analyzeMyResume} disabled={loading} className="btn-analyze">
              {loading ? 'Analyzing...' : 'Analyze Resume 🔍'}
            </button>

            {analysis && (
              <div className="analysis-result">
                <h3>AI Analysis</h3>
                <div className="analysis-content">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'build' && (
          <div className="tab-content">
            <h3>AI-Powered Section Generator</h3>
            
            <div className="section-selector">
              <label>Select Section Type</label>
              <select value={sectionType} onChange={(e) => setSectionType(e.target.value)}>
                <option value="summary">Professional Summary</option>
                <option value="project">Project Description</option>
                <option value="achievement">Achievement Bullet</option>
              </select>
            </div>

            {sectionType === 'summary' && (
              <div className="input-group">
                <div className="form-field">
                  <label>Experience Level</label>
                  <input
                    type="text"
                    value={userInfo.experience}
                    onChange={(e) => setUserInfo({...userInfo, experience: e.target.value})}
                    placeholder="e.g., Fresher, 2 years"
                  />
                </div>
                <div className="form-field">
                  <label>Key Skills</label>
                  <input
                    type="text"
                    value={userInfo.skills}
                    onChange={(e) => setUserInfo({...userInfo, skills: e.target.value})}
                    placeholder="e.g., Python, React, DSA"
                  />
                </div>
                <div className="form-field">
                  <label>Target Role</label>
                  <input
                    type="text"
                    value={userInfo.targetRole}
                    onChange={(e) => setUserInfo({...userInfo, targetRole: e.target.value})}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>
            )}

            {sectionType === 'project' && (
              <div className="input-group">
                <div className="form-field">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={userInfo.projectName}
                    onChange={(e) => setUserInfo({...userInfo, projectName: e.target.value})}
                    placeholder="e.g., E-commerce Website"
                  />
                </div>
                <div className="form-field">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    value={userInfo.technologies}
                    onChange={(e) => setUserInfo({...userInfo, technologies: e.target.value})}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div className="form-field">
                  <label>Brief Description</label>
                  <textarea
                    value={userInfo.description}
                    onChange={(e) => setUserInfo({...userInfo, description: e.target.value})}
                    placeholder="What did you build and what problem did it solve?"
                    rows="4"
                  />
                </div>
              </div>
            )}

            {sectionType === 'achievement' && (
              <div className="input-group">
                <div className="form-field">
                  <label>Your Achievement</label>
                  <textarea
                    value={userInfo.achievement}
                    onChange={(e) => setUserInfo({...userInfo, achievement: e.target.value})}
                    placeholder="Describe your achievement in simple terms..."
                    rows="4"
                  />
                </div>
              </div>
            )}

            <button onClick={generateSection} disabled={loading} className="btn-generate-section">
              {loading ? 'Generating...' : 'Generate Section ✨'}
            </button>

            {generatedSection && (
              <div className="generated-section">
                <h3>Generated Content</h3>
                <div className="generated-content">
                  {generatedSection}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedSection)}
                  className="btn-copy"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;