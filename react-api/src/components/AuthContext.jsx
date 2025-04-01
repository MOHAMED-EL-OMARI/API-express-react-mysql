import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);

                // Redirect to appropriate page based on role and current location
                if (location.pathname === '/') {
                    if (parsedUser.role === 'admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/database');
                    }
                }
            } catch (error) {
                console.error("Error parsing stored user:", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);

        if (userData.role === 'admin') {
            navigate('/dashboard');
        } else {
            navigate('/database');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
