import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const ProtectedRouter = ({ children, decodedToken }) => {
  /**
   * Check if the user is authenticated and authorized.
   * Ensure `decodedToken` is valid and contains required permissions.
   */
  const isAuthenticated = decodedToken && decodedToken.role === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

ProtectedRouter.propTypes = {
  children: PropTypes.node.isRequired,
  decodedToken: PropTypes.object, // Optional since it can be null
};

export default ProtectedRouter;
