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
            // First, test the connection
            const connectResponse = await fetch("http://localhost:5000/api/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const connectResult = await connectResponse.json();

            if (connectResponse.ok) {
                // If connection successful, store the application details
                const storeResponse = await fetch("http://localhost:5000/api/storeApplication", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                const storeResult = await storeResponse.json();

                if (storeResponse.ok) {
                    setMessage("Connection successful and stored!");
                    sessionStorage.setItem("dbConnection", JSON.stringify(data));
                    setTimeout(() => {
                        navigate("/tables");
                    }, 1000);
                } else {
                    setError("Connected but failed to store connection: " + storeResult.message);
                }
            } else {
                setError(connectResult.message || "Failed to connect to database");
                if (connectResponse.status === 401) {
                    navigate("/");
                }
            }
        } catch (error) {
            setError("Error processing your request");
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
