// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  console.log("PrivateRoute rendering: currentUser =", !!currentUser, "loading =", loading);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Authenticating user...</p>
      </div>
    );
  }

  console.log("PrivateRoute decision:", currentUser ? "Rendering outlet" : "Redirecting to login");
  
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;