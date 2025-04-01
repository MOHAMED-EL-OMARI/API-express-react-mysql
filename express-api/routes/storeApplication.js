const express = require('express');
const router = express.Router();
const { getConnection } = require('../db');
const auth = require("../middleware/auth");

router.post('/storeApplication', auth, (req, res) => {
    const { host, user, password, database, port } = req.body;
    const connection = getConnection();

    if (!connection) {
        return res.status(500).json({ success: false, message: "Database connection not established" });
    }

    // First check if this connection already exists
    const checkQuery = `SELECT * FROM applications WHERE host = ? AND user = ? AND database_name = ?`;
    connection.query(checkQuery, [host, user, database], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error checking existing connections",
                error: err.message
            });
        }

        // If connection already exists, return success but indicate it's existing
        if (results.length > 0) {
            return res.json({
                success: true,
                message: "Connection already exists",
                isExisting: true,
                connectionId: results[0].id
            });
        }

        // If connection doesn't exist, insert it
        const insertQuery = `INSERT INTO applications SET ?`;
        connection.query(insertQuery, { 
            host, 
            user, 
            password, 
            database_name: database,
            nom: database, 
            port 
        }, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error storing database connection",
                    error: err.message
                });
            }
            res.json({
                success: true,
                message: "Database connection stored successfully",
                isExisting: false,
                insertId: results.insertId
            });
        });
    });
});

module.exports = router;