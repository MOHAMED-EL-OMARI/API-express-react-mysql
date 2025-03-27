
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
    if (!token || token !== '7318aea003b669c6a28bf0e7862bf77ad9cbed4645adc6a330a4fa3c285e66b3') {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid API token' 
        });
    }
    next();
};

router.get("/orders_order_date_total", authApi, (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ 
            success: false,
            message: "Failed to connect to database" 
        });
    }

    const query = "SELECT order_date, total FROM orders";

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