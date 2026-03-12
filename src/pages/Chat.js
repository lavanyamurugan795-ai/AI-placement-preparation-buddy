import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithAI } from '../services/geminiService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I\'m your AI Placement Buddy. Ask me anything about DSA, interviews, placements, or any technical topic!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await chatWithAI(userMessage, conversationHistory);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
      console.error(error);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h2>💬 AI Chat Tutor</h2>
        <div></div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content typing">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything about placements, DSA, interviews..."
          rows="3"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Send 🚀
        </button>
      </div>
    </div>
  );
};

export default Chat;