// Kører npm start for at se applikationen i browseren på http://localhost:8000
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = 8000;

const bbrRouter = require("./routes/bbr_back");
const ejendomRouter = require("./routes/ejendom");
const ejendomsprofilRouter = require("./routes/ejendomsprofil");
const investeringscaseRouter = require("./routes/investeringscase");

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/", bbrRouter);
app.use("/api/ejendom", ejendomRouter);
app.use("/api/ejendomsprofil", ejendomsprofilRouter);
app.use("/api/investeringscase", investeringscaseRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server kører på ${PORT}`);
});

