const express = require("express");
const router = express.Router();
const { getConnection } = require("../dbConnection"); // Import the getConnection function

// Route to get table data
router.get("/tables", (req, res) => {
    const connection = getConnection();
    if (!connection) {
        return res.json({ message: "Not connected to any database!" });
    }

    connection.query("SHOW TABLES", (err, tables) => {
        if (err) {
            return res.json({
                message: "Error fetching tables: " + err.message,
            });
        }

        if (tables.length === 0) {
            return res.json({ tablesData: [] });
        }

        const tablesData = [];
        let completedQueries = 0;
        let errorOccurred = false; // Track errors

        tables.forEach((tableRow) => {
            const tableName = Object.values(tableRow)[0];

            connection.query(
                `SHOW COLUMNS FROM ${tableName}`,
                (err, columns) => {
                    if (err) {
                        if (!errorOccurred) {
                            errorOccurred = true;
                            return res.json({
                                message:
                                    "Error fetching columns: " + err.message,
                            });
                        }
                    } else {
                        connection.query(
                            `SELECT * FROM ${tableName}`,
                            (err, data) => {
                                if (err) {
                                    if (!errorOccurred) {
                                        errorOccurred = true;
                                        return res.json({
                                            message:
                                                "Error fetching data: " +
                                                err.message,
                                        });
                                    }
                                } else {
                                    tablesData.push({
                                        tableName,
                                        columns: columns.map((col) => ({
                                            name: col.Field,
                                            type: col.Type,
                                        })),
                                        data: data,
                                    });

                                    completedQueries++;
                                    if (
                                        completedQueries === tables.length &&
                                        !errorOccurred
                                    ) {
                                        res.json({ tablesData });
                                    }
                                }
                            }
                        );
                    }
                }
            );
        });
    });
});

module.exports = router;
