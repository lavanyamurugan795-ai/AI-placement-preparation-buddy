import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyPrepGuide } from '../services/geminiService';
import './CompanyPrep.css';

const CompanyPrep = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [guide, setGuide] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const topCompanies = [
    'Google', 'Amazon', 'Microsoft', 'Meta (Facebook)', 'Apple',
    'Netflix', 'Tesla', 'Goldman Sachs', 'Morgan Stanley', 'Adobe',
    'Salesforce', 'Oracle', 'IBM', 'Uber', 'Airbnb',
    'LinkedIn', 'Twitter', 'Spotify', 'Nvidia', 'Intel'
  ];

  const getGuide = async () => {
    const company = selectedCompany === 'other' ? customCompany : selectedCompany;
    
    if (!company) {
      alert('Please select or enter a company name!');
      return;
    }

    setLoading(true);
    try {
      const response = await getCompanyPrepGuide(company);
      setGuide(response);
    } catch (error) {
      alert('Failed to get preparation guide. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="company-prep-container">
      <div className="company-prep-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h2>🏢 Company-Specific Preparation</h2>
        <div></div>
      </div>

      <div className="company-prep-content">
        <div className="company-selector">
          <h3>Select Target Company</h3>

          <div className="company-grid">
            {topCompanies.map(company => (
              <div
                key={company}
                className={`company-card ${selectedCompany === company ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCompany(company);
                  setCustomCompany('');
                }}
              >
                <div className="company-icon">🏢</div>
                <div className="company-name">{company}</div>
              </div>
            ))}
            <div
              className={`company-card ${selectedCompany === 'other' ? 'selected' : ''}`}
              onClick={() => setSelectedCompany('other')}
            >
              <div className="company-icon">➕</div>
              <div className="company-name">Other</div>
            </div>
          </div>

          {selectedCompany === 'other' && (
            <div className="custom-company">
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="Enter company name..."
              />
            </div>
          )}

          <button onClick={getGuide} disabled={loading} className="btn-get-guide">
            {loading ? 'Loading Guide...' : 'Get Preparation Guide 📚'}
          </button>
        </div>

        {guide && (
          <div className="guide-result">
            <div className="guide-header-section">
              <h3>Preparation Guide for {selectedCompany === 'other' ? customCompany : selectedCompany}</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(guide)}
                className="btn-copy-guide"
              >
                📋 Copy Guide
              </button>
            </div>
            <div className="guide-content">
              {guide}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPrep;