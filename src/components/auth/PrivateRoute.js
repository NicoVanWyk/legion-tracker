import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const { currentUser, loading } = useAuth();

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;