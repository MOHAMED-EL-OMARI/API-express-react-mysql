const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

function updateRouteIndex(newRoutes) {
    // Create a routes index file that will import and export all routes
    const routeIndexPath = path.join(__dirname, "..", "routeIndex.js");
    
    // Check if routeIndex.js exists, if not create it with basic structure
    if (!fs.existsSync(routeIndexPath)) {
        const initialContent = `
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// This file only manages dynamically created APIs
// Core routes remain in index.js

// Function to load all dynamically created APIs
function loadCreatedApis() {
    const createdApisDir = path.join(__dirname, "createdApis");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(createdApisDir)) {
        fs.mkdirSync(createdApisDir);
        return; // No APIs to load yet
    }
    
    // Read all files in the createdApis directory
    const files = fs.readdirSync(createdApisDir);
    
    // Import and register each API route
    files.forEach(file => {
        if (file.endsWith('.js')) {
            // Use absolute path with path.resolve
            const apiRoute = require(path.resolve(__dirname, 'createdApis', file));
            router.use(apiRoute);
            console.log(\`Loaded dynamic API: \${file}\`);
        }
    });
}

// Load all created APIs on startup
loadCreatedApis();

module.exports = router;`;
        
        fs.writeFileSync(routeIndexPath, initialContent, "utf8");
    }
    
    // No need to update the routeIndex.js content anymore
    // The loadCreatedApis function will automatically load all APIs in the createdApis directory
}

function generateExpressApi(tableName, selectedColumns) {
    if (
        !tableName ||
        !selectedColumns ||
        !Array.isArray(selectedColumns) ||
        selectedColumns.length === 0
    ) {
        throw new Error(
            "Invalid parameters: tableName and selectedColumns are required"
        );
    }

    const columnNames = selectedColumns.join("_");
    const endpoint = `/${tableName.toLowerCase()}_${columnNames.toLowerCase()}`;
    const columnsString = selectedColumns.join(", ");
    const query = `SELECT ${columnsString} FROM ${tableName}`;

    const apiCode = `
const express = require('express');
const router = express.Router();
const { getConnection } = require('../dbConnection');

router.get("${endpoint}", (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ message: "Not connected to any database!" });
    }

    const query = "${query}";

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

module.exports = router;`;

    const fileName = `${tableName.toLowerCase()}_${columnNames.toLowerCase()}.js`;
    
    // Create createdApis directory if it doesn't exist
    const createdApisDir = path.join(__dirname, "..", "createdApis");
    if (!fs.existsSync(createdApisDir)) {
        fs.mkdirSync(createdApisDir);
    }
    
    const routePath = path.join(createdApisDir, fileName);

    return new Promise((resolve, reject) => {
        fs.writeFile(routePath, apiCode, "utf8", (err) => {
            if (err) {
                reject(new Error(`Failed to create API file: ${err.message}`));
            } else {
                resolve({ fileName, endpoint, query });
            }
        });
    });
}

// Route handler for API generation
router.post("/createApi", async (req, res) => {
    try {
        const { selectedColumns } = req.body;

        if (!selectedColumns || Object.keys(selectedColumns).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No columns selected",
            });
        }

        const results = [];
        for (const [tableName, columns] of Object.entries(selectedColumns)) {
            if (columns.length > 0) {
                try {
                    const result = await generateExpressApi(tableName, columns);
                    results.push(result);
                } catch (err) {
                    return res.status(500).json({
                        success: false,
                        message: `Error generating API for table ${tableName}: ${err.message}`,
                    });
                }
            }
        }

        // Update route index with new routes
        try {
            updateRouteIndex(results);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: `Error updating route index: ${err.message}`,
            });
        }

        res.json({
            success: true,
            message: "APIs created successfully!",
            apis: results.map((r) => ({
                fileName: r.fileName,
                endpoint: r.endpoint,
                query: r.query,
            })),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating API: " + error.message,
        });
    }
});

module.exports = router;
