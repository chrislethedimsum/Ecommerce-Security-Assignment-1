const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD, // dùng .env
  database: process.env.DB_NAME,
});

module.exports = pool;