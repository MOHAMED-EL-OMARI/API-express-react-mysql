const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const ApiController = require('../controllers/apiController');

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

function generateExpressApi(tableName, selectedColumns, token) {
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

    // Read connection config
    let connectionConfig;
    try {
        const configPath = path.join(__dirname, "..", "connectionConfig.json");
        if (fs.existsSync(configPath)) {
            connectionConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
            throw new Error("Connection configuration not found");
        }
    } catch (error) {
        throw new Error(`Failed to read connection config: ${error.message}`);
    }

    const columnNames = selectedColumns.join("_");
    const endpoint = `/${tableName.toLowerCase()}_${columnNames.toLowerCase()}`;
    const columnsString = selectedColumns.join(", ");

    const apiCode = `
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Static connection configuration
const connectionConfig = {
    host: "${connectionConfig.host}",
    user: "${connectionConfig.user}",
    password: "${connectionConfig.password}",
    database: "${connectionConfig.database}",
    port: ${connectionConfig.port}
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
    if (!token || token !== '${token}') {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid API token' 
        });
    }
    next();
};

router.get("${endpoint}", authApi, (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ 
            success: false,
            message: "Failed to connect to database" 
        });
    }

    const query = "SELECT ${columnsString} FROM ${tableName}";

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
                resolve({ fileName, endpoint, tableName, columns: selectedColumns });
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
                    // Generate the API file and get its data
                    const apiData = await generateExpressApi(tableName, columns);
                    
                    // Store API data in database and get the token
                    const storedApi = await ApiController.createApi(apiData);
                    
                    if (storedApi.exists) {
                        // If API exists, just add it to results without regenerating
                        results.push({
                            fileName: `${tableName.toLowerCase()}_${columns.join('_').toLowerCase()}.js`,
                            endpoint: storedApi.endpoint,
                            token: storedApi.token,
                            url: storedApi.url,
                            message: "API already exists"
                        });
                    } else {
                        // If new API, regenerate with token and add to results
                        await generateExpressApi(tableName, columns, storedApi.token);
                        results.push(storedApi);
                    }
                } catch (err) {
                    return res.status(500).json({
                        success: false,
                        message: `Error generating API for table ${tableName}: ${err.message}`,
                    });
                }
            }
        }

        // Update route index
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
            message: "APIs processed successfully!",
            apis: results.map((r) => ({
                fileName: r.fileName,
                endpoint: r.endpoint,
                token: r.token,
                url: r.url,
                message: r.message || "API created successfully"
            })),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error processing API: " + error.message,
        });
    }
});

module.exports = router;
