// src/App.js (Updated with Profile routes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Units from './pages/Units';
import Armies from './pages/Armies';
import Battles from './pages/Battles';
import ReferencePage from './pages/ReferencePage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Custom styles

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          
          <Container className="flex-grow-1 mb-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Reference Routes - Public Access for Viewing */}
              <Route path="/references" element={<ReferencePage />} />
              <Route path="/references/:id" element={<ReferencePage />} />
              
              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                {/* Units Routes */}
                <Route path="/units" element={<Units />} />
                <Route path="/units/:unitId" element={<Units />} />
                <Route path="/units/create" element={<Units />} />
                <Route path="/units/edit/:unitId" element={<Units />} />
                
                {/* Army Routes */}
                <Route path="/armies" element={<Armies />} />
                <Route path="/armies/:armyId" element={<Armies />} />
                <Route path="/armies/create" element={<Armies />} />
                <Route path="/armies/edit/:armyId" element={<Armies />} />
                
                {/* Battle Routes */}
                <Route path="/battles" element={<Battles />} />
                <Route path="/battles/:battleId" element={<Battles />} />
                <Route path="/battles/create" element={<Battles />} />
                <Route path="/battles/edit/:battleId" element={<Battles />} />
                
                {/* References Creation/Edit Routes - Authenticated Only */}
                <Route path="/references/create" element={<ReferencePage />} />
                <Route path="/references/edit/:id" element={<ReferencePage />} />
                
                {/* Profile Routes - New */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/settings" element={<ProfilePage />} />
                <Route path="/profile/stats" element={<ProfilePage />} />
              </Route>
              
              {/* Home page is accessible to everyone */}
              <Route path="/" element={<Home />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;