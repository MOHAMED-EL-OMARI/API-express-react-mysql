const express = require('express');
const router = express.Router();
const { getConnection } = require('../db');

router.post('/storeConnection', (req, res) => {
    const { host, user, password, database, port } = req.body;
    const connection = getConnection();

    if (!connection) {
        return res.status(500).json({ success: false, message: "Database connection not established" });
    }

    const query = `INSERT INTO application SET ?`;
    connection.query(query, { 
        host, 
        user, 
        password, 
        database_name: database,
        nom: database, // Set nom to be the same as database_name
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
            insertId: results.insertId
        });
    });
});

module.exports = router;