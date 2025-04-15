import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from './utils/isTokenExpired';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
