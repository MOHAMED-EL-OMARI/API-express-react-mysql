import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./authcontext";

const ProtectedRoute = ({ children }) => {
    const { user, token } = useContext(AuthContext);

    // If there's no token in localStorage, redirect immediately
    if (!localStorage.getItem('token')) {
        return <Navigate to="/" replace />;
    }

    // If auth context is still initializing
    if (user === null || token === null) {
        return null;
    }

    // If auth check is complete but no valid user/token
    if (!user || !token) {
        return <Navigate to="/" replace />;
    }

    // User is authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
