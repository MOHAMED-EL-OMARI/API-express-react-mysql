
const express = require('express');
const router = express.Router();
const { getConnection } = require('../dbConnection');

router.get("/products_name", (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ message: "Not connected to any database!" });
    }

    const query = "SELECT name FROM products";

    connection.query(query, (err, results) => {
        if (err) {
            return res.json({ 
                success: false,
                message: "Error fetching data: " + err.message 
            });
        }

        if (results.length === 0) {
            return res.json({ 
                success: false,
                message: "No data found" 
            });
        }

        return res.json({ 
            success: true,
            data: results
        });
    });
});

module.exports = router;