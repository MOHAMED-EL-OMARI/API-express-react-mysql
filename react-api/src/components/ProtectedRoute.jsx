import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./authcontext";

const ProtectedRoute = ({ children }) => {
    const { user, token } = useContext(AuthContext);

    if (user === null || token === null) {
        return null; // Wait for auth check
    }

    if (!user || !token) {
        // User is not authenticated, redirect to login page
        return <Navigate to="/" replace />;
    }

    // User is authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
