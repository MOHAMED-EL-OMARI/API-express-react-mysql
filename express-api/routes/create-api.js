const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function updateIndexFile(newRoutes) {
    const indexPath = path.join(__dirname, '..', 'index.js');
    
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) throw err;

        // Add new imports at the top with other requires
        let updatedContent = data;
        const importStatements = newRoutes.map(route => 
            `const ${route.fileName.replace('.js', '')} = require("./routes/${route.fileName}");`
        ).join('\n');
        
        // Insert after the last require statement
        const lastRequireIndex = updatedContent.lastIndexOf('require(');
        const insertIndex = updatedContent.indexOf('\n', lastRequireIndex) + 1;
        updatedContent = updatedContent.slice(0, insertIndex) + 
                        importStatements + '\n' + 
                        updatedContent.slice(insertIndex);

        // Add new route uses before the listen statement
        const routeStatements = newRoutes.map(route =>
            `app.use("/api", ${route.fileName.replace('.js', '')});`
        ).join('\n');
        
        const listenIndex = updatedContent.indexOf('app.listen');
        updatedContent = updatedContent.slice(0, listenIndex) + 
                        routeStatements + '\n\n' + 
                        updatedContent.slice(listenIndex);

        fs.writeFile(indexPath, updatedContent, 'utf8', (err) => {
            if (err) throw err;
        });
    });
}

function generateExpressApi(tableName, selectedColumns) {
    const columnNames = selectedColumns.join('_');
    const endpoint = `/${tableName.toLowerCase()}_${columnNames.toLowerCase()}`;
    const columnsString = selectedColumns.join(', ');
    const query = `SELECT ${columnsString} FROM ${tableName}`;

    const apiCode = `
const express = require('express');
const router = express.Router();
const { getConnection } = require('../db');

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
    
    return new Promise((resolve, reject) => {
        fs.writeFile(`./routes/${fileName}`, apiCode, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ fileName, endpoint, query });
            }
        });
    });
}

// Route handler for API generation
router.post('/generate-api', async (req, res) => {
    try {
        const { selectedColumns } = req.body;
        
        if (!selectedColumns || Object.keys(selectedColumns).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No columns selected' 
            });
        }

        const results = [];
        for (const [tableName, columns] of Object.entries(selectedColumns)) {
            if (columns.length > 0) {
                const result = await generateExpressApi(tableName, columns);
                results.push(result);
            }
        }

        // Update index.js with new routes
        updateIndexFile(results);

        res.json({ 
            success: true, 
            message: 'APIs created successfully!',
            apis: results.map(r => ({
                fileName: r.fileName,
                endpoint: r.endpoint,
                query: r.query
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating API: ' + error.message 
        });
    }
});

module.exports = router;
