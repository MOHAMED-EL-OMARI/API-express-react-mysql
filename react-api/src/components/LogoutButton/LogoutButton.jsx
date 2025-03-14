import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authcontext";
import axios from "axios";
import "./LogoutButton.css";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/logout");
            logout(); // Clear auth context
            navigate("/"); // Redirect to login page
        } catch (error) {
            console.error("Logout error:", error);
            // Still logout the user locally even if the server request fails
            logout();
            navigate("/");
        }
    };

    return (
        <button className="logout-button" onClick={handleLogout}>
            Logout
        </button>
    );
};

export default LogoutButton;
