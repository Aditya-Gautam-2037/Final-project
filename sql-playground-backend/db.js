const mysql = require('mysql2/promise'); // ✅ use /promise version
require('dotenv').config();

const connectMySQL = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      multipleStatements: true, // ✅ Enable multiple statements
    });

    console.log('✅ Connected to MySQL database');
    return connection;
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
};

module.exports = connectMySQL;
