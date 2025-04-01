const express = require('express');
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { getConnection } = require('../db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Route for creating users (admin only)
router.post("/users/create", adminAuth, async (req, res) => {
    const { name, email, password, role } = req.body;

    // Ensure the request comes from an admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    // Validate input
    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role. Must be either 'user' or 'admin'"
        });
    }

    try {
        const connection = getConnection();
        
        // Check if user already exists
        const checkQuery = "SELECT * FROM users WHERE email = ?";
        connection.query(checkQuery, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error: " + err.message
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const insertQuery = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            connection.query(insertQuery, [name, email, hashedPassword, role], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Error creating user: " + err.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "User created successfully",
                    userId: result.insertId
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

// Route for getting all APIs (admin only)
router.get("/apis", adminAuth, (req, res) => {
    try {
        const connection = getConnection();
        const query = `
            SELECT id, name, endpoint, url, table_name, columns, is_active, 
                   created_at, updated_at 
            FROM apis 
            ORDER BY created_at DESC
        `;

        connection.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching APIs: " + err.message
                });
            }

            // Format the columns field if it's stored as JSON string
            const formattedApis = results.map(api => ({
                ...api,
                columns: typeof api.columns === 'string' ? JSON.parse(api.columns) : api.columns
            }));

            res.json({
                success: true,
                apis: formattedApis
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });
    }
});

// Route for managing API status (admin only)
router.put("/apis/:id/:action", adminAuth, (req, res) => {
    const { id, action } = req.params;
    const connection = getConnection();

    try {
        switch (action) {
            case 'activate':
                connection.query(
                    'UPDATE apis SET is_active = true, updated_at = NOW() WHERE id = ?',
                    [id],
                    handleApiUpdate
                );
                break;

            case 'deactivate':
                connection.query(
                    'UPDATE apis SET is_active = false, updated_at = NOW() WHERE id = ?',
                    [id],
                    handleApiUpdate
                );
                break;

            case 'delete':
                // First get the API details to know the endpoint
                connection.query('SELECT endpoint FROM apis WHERE id = ?', [id], (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Error fetching API details: " + err.message
                        });
                    }

                    if (results.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "API not found"
                        });
                    }

                    const endpoint = results[0].endpoint.substring(1); // Remove leading slash
                    const fileName = `${endpoint}.js`;
                    const filePath = path.join(__dirname, '..', 'createdApis', fileName);

                    // Delete from database
                    connection.query('DELETE FROM apis WHERE id = ?', [id], (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Error deleting API from database: " + err.message
                            });
                        }

                        // Delete file from createdApis folder
                        try {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                            
                            res.json({
                                success: true,
                                message: "API deleted successfully from database and file system"
                            });
                        } catch (fsError) {
                            res.status(500).json({
                                success: false,
                                message: "API deleted from database but failed to delete file: " + fsError.message
                            });
                        }
                    });
                });
                break;

            default:
                res.status(400).json({
                    success: false,
                    message: "Invalid action"
                });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message
        });
    }

    function handleApiUpdate(err, result) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: `Error updating API: ${err.message}`
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API not found"
            });
        }
        res.json({
            success: true,
            message: `API ${action}d successfully`
        });
    }
});

module.exports = router;