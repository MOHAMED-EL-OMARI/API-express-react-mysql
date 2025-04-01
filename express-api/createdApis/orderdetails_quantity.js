
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { getConnection } = require("../db");

// Static connection configuration
const connectionConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "tst",
    port: 3306
};

// Function to get database connection
const getConn = () => {
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
        if (!token || token !== '7b549e29989c2b8bbd4b701ecc8ed5ef7d7f677c1f5f9cf7b49773b20705441c') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid API token' 
            });
        }
        
        // Check if API is active
        const connection = getConnection();
        if (!connection) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed' 
            });
        }

        const checkActiveQuery = "SELECT is_active FROM apis WHERE endpoint = ?";
        connection.query(checkActiveQuery, ["/orderdetails_quantity"], (err, results) => {
            if (err) {
                connection.end();
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error checking API status' 
                });
            }

            if (!results[0] || !results[0].is_active) {
                connection.end();
                return res.status(403).json({ 
                    success: false, 
                    message: 'This API is currently inactive' 
                });
            }

            next();
        });
    };

router.get("/orderdetails_quantity", authApi, (req, res) => {
    const connection = getConn();
    if (!connection) {
        return res.json({ 
            success: false,
            message: "Failed to connect to database" 
        });
    }

    const query = "SELECT quantity FROM orderdetails";

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