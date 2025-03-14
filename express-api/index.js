require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getConnection } = require("./db");
// Import route files
const loginRouter = require("./routes/login");
const connectRouter = require("./routes/connect");
const tablesRouter = require("./routes/tables");
const logoutRoute = require("./routes/logout");

const app = express();
const PORT = 5000;

getConnection();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
// Use the routes
app.use("/api", loginRouter);
app.use("/api", connectRouter);
app.use("/api", tablesRouter);
app.use("/api", logoutRoute);

app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
