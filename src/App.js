import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import MockInterview from './pages/MockInterview';
import DSAPractice from './pages/DSAPractice';
import ResumeBuilder from './pages/ResumeBuilder';
import StudyRoadmap from './pages/StudyRoadmap';
import CompanyPrep from './pages/CompanyPrep';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Default route */}
          <Route index element={<Navigate to="/login" />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dsa-practice"
            element={
              <ProtectedRoute>
                <DSAPractice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/study-roadmap"
            element={
              <ProtectedRoute>
                <StudyRoadmap />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-prep"
            element={
              <ProtectedRoute>
                <CompanyPrep />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
export default App;