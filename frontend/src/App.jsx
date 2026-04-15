import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<ResumeUploadPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/login" element={<Navigate to="/upload" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
