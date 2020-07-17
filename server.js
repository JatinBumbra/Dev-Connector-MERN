const express = require("express");
const connectDB = require("./config/db");
const { connect } = require("mongoose");

const app = express();

// Connect to database
connectDB();

app.get("/", (req, res) => res.send("Welcome"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
