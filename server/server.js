require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: ["http://localhost:5173"] })); // ใช้ CORS สำหรับ frontend
app.use(bodyParser.json()); // ใช้สำหรับ parse JSON requests

const apiRoutes = require("./routes/apiRoutes");
app.use(apiRoutes);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT}`);
});
