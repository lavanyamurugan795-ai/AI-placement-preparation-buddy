import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMockInterview, chatWithAI } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import './MockInterview.css';

const MockInterview = () => {
  const [started, setStarted] = useState(false);
  const [interviewType, setInterviewType] = useState('technical');
  const [experience, setExperience] = useState('fresher');
  const [role, setRole] = useState('Software Engineer');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await generateMockInterview(interviewType, experience, role);
      setMessages([{ role: 'interviewer', content: response }]);
      setStarted(true);
    } catch (error) {
      alert('Failed to start interview. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'candidate', content: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'candidate' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const context = `Continue the ${interviewType} interview. The candidate just answered: "${userMessage}". 
      Provide feedback if appropriate, then ask the next relevant question or conclude if enough questions have been asked.`;
      
      const response = await chatWithAI(context, conversationHistory);
      setMessages(prev => [...prev, { role: 'interviewer', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        content: 'Sorry, I encountered an error. Please continue.' 
      }]);
    }
    setLoading(false);
  };

  const endInterview = async () => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'progress.mockInterviewsTaken': increment(1)
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
    navigate('/dashboard');
  };

  if (!started) {
    return (
      <div className="interview-setup">
        <div className="setup-card">
          <h2>🎤 Mock Interview Setup</h2>
          <button onClick={() => navigate('/dashboard')} className="back-btn-small">← Back to Dashboard</button>
          
          <div className="setup-form">
            <div className="form-group">
              <label>Interview Type</label>
              <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                <option value="technical">Technical Interview</option>
                <option value="hr">HR Interview</option>
                <option value="behavioral">Behavioral Interview</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="fresher">Fresher</option>
                <option value="0-2 years">0-2 Years</option>
                <option value="2-5 years">2-5 Years</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer, Data Analyst"
              />
            </div>

            <button onClick={startInterview} disabled={loading} className="btn-start">
              {loading ? 'Starting Interview...' : 'Start Interview 🚀'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>🎤 Mock Interview - {interviewType}</h2>
        <button onClick={endInterview} className="btn-end">End Interview</button>
      </div>

      <div className="interview-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`interview-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'candidate' ? '👤' : '👨‍💼'}
            </div>
            <div className="message-bubble">
              <strong>{msg.role === 'candidate' ? 'You' : 'Interviewer'}:</strong>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="interview-message interviewer">
            <div className="message-avatar">👨‍💼</div>
            <div className="message-bubble typing">Thinking...</div>
          </div>
        )}
      </div>

      <div className="interview-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer here..."
          rows="4"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send Answer
        </button>
      </div>
    </div>
  );
};

export default MockInterview;