const { getConnection } = require('../db');
const crypto = require('crypto');

class Api {
    static generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    static async create(apiData) {
        return new Promise((resolve, reject) => {
            const connection = getConnection();
            if (!connection) {
                reject(new Error("No database connection"));
                return;
            }

            // Check if API already exists
            const checkQuery = `
                SELECT * FROM apis 
                WHERE table_name = ? 
                AND columns = ?
            `;

            connection.query(checkQuery, [
                apiData.tableName,
                JSON.stringify(apiData.columns)
            ], (checkErr, checkResults) => {
                if (checkErr) {
                    reject(checkErr);
                    return;
                }

                if (checkResults.length > 0) {
                    resolve({
                        exists: true,
                        message: "API already exists",
                        ...checkResults[0]
                    });
                    return;
                }

                // If API doesn't exist, create it
                const token = this.generateToken();
                
                const query = `
                    INSERT INTO apis (
                        name,
                        endpoint,
                        url,
                        table_name,
                        columns,
                        token,
                        is_active,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                `;

                const values = [
                    apiData.endpoint,
                    apiData.endpoint,
                    `http://localhost:5000/api${apiData.endpoint}`,
                    apiData.tableName,
                    JSON.stringify(apiData.columns),
                    token,
                    true
                ];

                connection.query(query, values, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ 
                        exists: false,
                        ...apiData, 
                        token, 
                        id: result.insertId 
                    });
                });
            });
        });
    }
}

module.exports = Api;