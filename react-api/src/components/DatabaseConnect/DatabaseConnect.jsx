import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../authcontext";
import "./DatabaseConnect.css";

const DatabaseConnection = () => {
    const [host, setHost] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [database, setDatabase] = useState("");
    const [port, setPort] = useState(3306);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { token, logout } = useContext(AuthContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!token) {
            setError("Authentication required");
            navigate("/");
            return;
        }

        const data = {
            host,
            user,
            password,
            database,
            port,
        };

        try {
            const response = await fetch("http://localhost:5000/api/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("Connection successful!");
                // Store connection info in sessionStorage if needed
                sessionStorage.setItem("dbConnection", JSON.stringify(data));
                // Navigate to tables page after successful connection
                setTimeout(() => {
                    navigate("/tables");
                }, 1000);
            } else {
                setError(result.message || "Failed to connect to database");
                if (response.status === 401) {
                    navigate("/");
                }
            }
        } catch (error) {
            setError("Error connecting to the database");
        }
    };

    return (
        <div className="connection-container">
            <h2>Connect to MySQL Database</h2>
            <form onSubmit={handleSubmit}>
                <label>Host:</label>
                <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                />

                <label>User:</label>
                <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Database:</label>
                <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    required
                />

                <label>Port:</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    required
                />

                <button type="submit" className="connect-button">
                    Connect
                </button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <button onClick={logout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default DatabaseConnection;
