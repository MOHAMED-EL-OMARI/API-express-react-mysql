const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getConnection } = require("../db");

router.post("/login", async (req, res) => {
    const { name, password } = req.body;
    const connection = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "Database connection not established",
        });
    }

    try {
        const query = "SELECT * FROM users WHERE name = ?";

        connection.query(query, [name], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error querying database",
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid name or password",
                });
            }

            const user = results[0];

            try {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const token = jwt.sign(
                        { id: user.id, name: user.name },
                        process.env.JWT_SECRET,
                        { expiresIn: "24h" }
                    );

                    delete user.password;
                    delete user.email;
                    delete user.role_id;

                    return res.json({
                        success: true,
                        user,
                        token,
                    });
                }

                return res.status(401).json({
                    success: false,
                    message: "Invalid name or password",
                });
            } catch (bcryptError) {
                console.error("Password comparison error:", bcryptError);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred during password verification",
                });
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during login",
        });
    }
});

module.exports = router;
