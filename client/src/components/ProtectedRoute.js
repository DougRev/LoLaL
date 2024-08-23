import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setChecked(true);
    }
  }, [isAuthenticated]);

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);

  if (!checked) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`User does not have the required role: ${requiredRole}, redirecting to unauthorized page`);
    return <Navigate to="/unauthorized" />;
  }

  console.log('User authenticated and authorized, rendering children');
  return children;
};

export default ProtectedRoute;
