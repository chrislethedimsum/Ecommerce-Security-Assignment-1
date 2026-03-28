require("dotenv").config();
const express = require('express');
const mysql = require("mysql2/promise");
const cookieParser = require('cookie-parser');
const session = require('express-session');

const mainRoute = require("./router/mainRoute");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'secretkey123',
    resave: false,
    saveUninitialized: true
}));

//MYSQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
});


app.use("/", mainRoute);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
});
