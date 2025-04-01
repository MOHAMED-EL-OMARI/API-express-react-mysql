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
const createApiRoute = require("./routes/createApi");
const storeApplication = require("./routes/storeApplication");
const adminRoutes = require("./routes/admin"); // Add this line
// Import dynamically created APIs
const createdApis = require("./routeIndex");

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
app.use("/api", createApiRoute);
app.use("/api", storeApplication);
app.use("/api/admin", adminRoutes); // Add this line
// Use dynamically created APIs
app.use("/api", createdApis);

app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
