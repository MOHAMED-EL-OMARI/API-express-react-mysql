const mysql = require("mysql2");
const fs = require('fs');
const path = require('path');

let connection;
let currentConfig;

// Function to establish the connection
const connectDB = (config) => {
    currentConfig = config;
    connection = mysql.createConnection(config);

    connection.connect((err) => {
        if (err) {
            console.error("Connection failed: " + err.message);
        } else {
            console.log("Connected successfully!");
            // Store the current connection config
            saveConnectionConfig(config);
        }
    });
};

// Function to save connection config
const saveConnectionConfig = (config) => {
    const configPath = path.join(__dirname, 'connectionConfig.json');
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
};

// Function to restore connection from saved config
const restoreConnection = () => {
    try {
        const configPath = path.join(__dirname, 'connectionConfig.json');
        if (fs.existsSync(configPath)) {
            const savedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            connectDB(savedConfig);
        }
    } catch (error) {
        console.error("Error restoring connection:", error);
    }
};

// Function to get the connection
const getConnection = () => {
    if (!connection && currentConfig) {
        connectDB(currentConfig);
    }
    return connection;
};

// Restore connection on module load
restoreConnection();

// Add this new function
const disconnectDB = () => {
    if (connection) {
        connection.end();
        connection = null;
        currentConfig = null;
        // Remove the saved config
        const configPath = path.join(__dirname, 'connectionConfig.json');
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
    }
};

// Update the exports
module.exports = { connectDB, getConnection, disconnectDB };
