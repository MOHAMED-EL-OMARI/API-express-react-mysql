import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './authcontext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/" />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/database" />;
    }

    return children;
};

export default ProtectedRoute;
