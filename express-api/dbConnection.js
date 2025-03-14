const mysql = require("mysql2");

let connection;

// Function to establish the connection
const connectDB = (config) => {
    connection = mysql.createConnection(config);

    connection.connect((err) => {
        if (err) {
            console.error("Connection failed: " + err.message);
        } else {
            console.log("Connected successfully!");
        }
    });
};

// Function to get the connection (so it can be used in other files)
const getConnection = () => connection;

module.exports = { connectDB, getConnection };
