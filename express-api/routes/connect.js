const express = require("express");
const router = express.Router();
const { connectDB, getConnection, disconnectDB } = require("../dbConnection");
const auth = require("../middleware/auth");


router.post("/connect", auth, async (req, res) => {
    const { host, user, password, database, port } = req.body;

    try {
        // Create the connection using the values from the request
        await connectDB({ host, user, password, database, port });
        
        // If we get here, connection was successful
        res.json({ message: "Connected successfully!" });
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
