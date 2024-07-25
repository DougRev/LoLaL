import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
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

  console.log('User authenticated, rendering children');
  return children;
};

export default ProtectedRoute;
