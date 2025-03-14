const mysql = require("mysql2");

let connection = null;

function initConnection() {
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "bus_api",
    });

    connection.connect((err) => {
        if (err) {
            console.error("Error connecting to the database:", err.stack);
            return;
        }
        console.log("Connected to the database");
    });
}

function getConnection() {
    if (!connection) {
        initConnection();
    }
    return connection;
}

module.exports = { getConnection };