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
            // Fix: Use absolute path with path.resolve
            const apiRoute = require(path.resolve(__dirname, 'createdApis', file));
            router.use(apiRoute);
            console.log(`Loaded dynamic API: ${file}`);
        }
    });
}

// Load all created APIs on startup
loadCreatedApis();

module.exports = router;