
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Static connection configuration
const connectionConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "tst",
    port: 3306
};

// Function to get database connection
const getConnection = () => {
    try {
        return mysql.createConnection(connectionConfig);
    } catch (error) {
        console.error("Error creating connection:", error);
        return null;
    }
};

// Custom auth middleware for this specific API
const authApi = (req, res, next) => {
    const token = req.header('Api-Token');
    if (!token || token !== '946cbf730a1cc27e9ee1c91968335674520500318ab856a460f803a8500aa1c1') {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid API token' 
        });
    }
    next();
};

router.get("/users_name_age", authApi, (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ 
            success: false,
            message: "Failed to connect to database" 
        });
    }

    const query = "SELECT name, age FROM users";

    connection.query(query, (err, results) => {
        if (err) {
            connection.end();
            return res.json({ 
                success: false,
                message: "Error fetching data: " + err.message 
            });
        }

        if (results.length === 0) {
            connection.end();
            return res.json({ 
                success: false,
                message: "No data found" 
            });
        }

        connection.end();
        return res.json({ 
            success: true,
            data: results
        });
    });
});

module.exports = router;