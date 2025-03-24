const express = require("express");
const router = express.Router();
const { connectDB, getConnection } = require("../dbConnection");
const auth = require("../middleware/auth");

// Add disconnect function
const disconnectDB = () => {
    const connection = getConnection();
    if (connection) {
        connection.end();
        return true;
    }
    return false;
};

router.post("/connect", auth, (req, res) => {
    const { host, user, password, database, port } = req.body;

    try {
        // Create the connection using the values from the request
        connectDB({ host, user, password, database, port });

        // Check if connection was successful
        if (require('../dbConnection').getConnection()) {
            res.json({ message: "Connected successfully!" });
        } else {
            res.status(500).json({ message: "Failed to establish connection" });
        }
    } catch (error) {
        res.status(500).json({ message: "Connection error: " + error.message });
    }
});

// Moved disconnect route outside of connect route
router.post("/disconnect", auth, (req, res) => {
    try {
        const disconnected = disconnectDB();
        if (disconnected) {
            res.json({ success: true, message: "Disconnected from database" });
        } else {
            res.status(400).json({ success: false, message: "No active connection to disconnect" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error disconnecting from database" });
    }
});

module.exports = router;
