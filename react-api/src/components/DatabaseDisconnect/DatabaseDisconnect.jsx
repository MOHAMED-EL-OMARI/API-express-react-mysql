import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../authcontext";
import './DatabaseDisconnect.css';

const DatabaseDisconnect = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const handleDatabaseDisconnect = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/disconnect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                sessionStorage.removeItem("dbConnection");
                navigate("/database");
            } else {
                setError(result.message || "Failed to disconnect from database");
            }
        } catch (error) {
            setError("Error disconnecting from database");
        }
    };

    return (
        <>
            <button onClick={handleDatabaseDisconnect} className="disconnect-button">
                Disconnect Database
            </button>
            {error && <p className="error-message">{error}</p>}
        </>
    );
};

export default DatabaseDisconnect;