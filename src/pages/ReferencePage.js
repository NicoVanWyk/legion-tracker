// src/pages/ReferencePage.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReferenceList from '../components/reference/ReferenceList';
import ReferenceDetail from '../components/reference/ReferenceDetail';
import ReferenceForm from '../components/reference/ReferenceForm';
import { useAuth } from '../contexts/AuthContext';

const ReferencePage = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Determine active tab based on current path
  const isListActive = location.pathname === '/references';
  const isCreateActive = location.pathname === '/references/create';
  
  return (
    <div className="reference-page">
      <div className="page-header">
        <h1>References</h1>
        <p>Look up rules, keywords, and game mechanics</p>
      </div>
      
      <div className="tab-navigation">
        <Link 
          to="/references" 
          className={`tab ${isListActive ? 'active' : ''}`}
        >
          Browse References
        </Link>
        
        {currentUser && (
          <Link 
            to="/references/create" 
            className={`tab ${isCreateActive ? 'active' : ''}`}
          >
            Create Reference
          </Link>
        )}
      </div>
      
      <div className="reference-content">
        <Routes>
          <Route path="/" element={<ReferenceList />} />
          <Route path="/create" element={<ReferenceForm />} />
          <Route path="/edit/:id" element={<ReferenceForm />} />
          <Route path="/:id" element={<ReferenceDetail />} />
        </Routes>
      </div>
    </div>
  );
};

export default ReferencePage;