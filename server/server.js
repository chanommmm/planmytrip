require("dotenv").config();  // โหลดค่า .env

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(bodyParser.json());

const apiRoutes = require("./routes/apiRoutes");
app.use(apiRoutes);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`🔑 Google API Key: ${process.env.GOOGLE_MAPS_API_KEY}`);
    
});
