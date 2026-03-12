import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDSAProblem, analyzeCode, getHint } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import './DSAPractice.css';

const DSAPractice = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [topic, setTopic] = useState('Arrays');
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const topics = [
    'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
    'Dynamic Programming', 'Recursion', 'Sorting', 'Searching', 
    'Hash Tables', 'Stack', 'Queue', 'Greedy', 'Backtracking'
  ];

  const generateProblem = async () => {
    setLoading(true);
    setProblem(null);
    setFeedback('');
    setHint('');
    setCode('');
    
    try {
      const response = await generateDSAProblem(difficulty, topic);
      setProblem(response);
    } catch (error) {
      alert('Failed to generate problem. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  const submitCode = async () => {
    if (!code.trim()) {
      alert('Please write your code first!');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeCode(code, problem);
      setFeedback(response);
      
      // Update user progress
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'progress.problemsSolved': increment(1)
        });
      }
    } catch (error) {
      alert('Failed to analyze code. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  const getHintForProblem = async () => {
    if (!problem) return;
    
    setLoading(true);
    try {
      const response = await getHint(problem, code || 'No approach yet');
      setHint(response);
    } catch (error) {
      alert('Failed to get hint. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="dsa-container">
      <div className="dsa-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h2>💻 DSA Problem Solver</h2>
        <div></div>
      </div>

      <div className="dsa-content">
        <div className="problem-generator">
          <h3>Generate New Problem</h3>
          
          <div className="generator-controls">
            <div className="control-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="control-group">
              <label>Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button onClick={generateProblem} disabled={loading} className="btn-generate">
              {loading ? 'Generating...' : 'Generate Problem 🎲'}
            </button>
          </div>
        </div>

        {problem && (
          <div className="problem-section">
            <div className="problem-display">
              <h3>Problem</h3>
              <div className="problem-content">
                {problem}
              </div>
              <button onClick={getHintForProblem} disabled={loading} className="btn-hint">
                💡 Get Hint
              </button>
            </div>

            {hint && (
              <div className="hint-box">
                <strong>💡 Hint:</strong>
                <p>{hint}</p>
              </div>
            )}

            <div className="code-editor">
              <h3>Your Solution</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                rows="15"
              />
              <button onClick={submitCode} disabled={loading || !code.trim()} className="btn-submit">
                {loading ? 'Analyzing...' : 'Submit & Get Feedback 🚀'}
              </button>
            </div>

            {feedback && (
              <div className="feedback-section">
                <h3>AI Feedback</h3>
                <div className="feedback-content">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAPractice;