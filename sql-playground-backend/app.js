const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongoDB = require('./mongo');
const connectMySQL = require('./db');
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const sqlite3 = require('sqlite3').verbose(); // Add SQLite for database initialization
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', queryRoutes);

app.get('/', (req, res) => {
  res.send('🎉 SQL Playground Backend is running');
});

const initializeSQLite = () => {
  const dbPath = './uploads/database.db'; // Path to SQLite database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to initialize SQLite database:', err.message);
    } else {
      console.log('✅ SQLite database initialized at', dbPath);
    }
  });
  db.close();
};

const startServer = async () => {
  initializeSQLite(); // Initialize SQLite database
  await connectMongoDB(); // MongoDB connection
  await connectMySQL();   // MySQL connection test
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
