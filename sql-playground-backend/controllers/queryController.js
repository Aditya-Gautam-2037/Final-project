const connectMySQL = require('../db');
const QueryHistory = require('../models/QueryHistory');

// @desc Execute SQL query
// @route POST /api/execute-sql
// @access Protected
exports.executeQuery = async (req, res) => {
  const { sql } = req.body; // Expecting `sql` in the request body
  const userId = req.user.userId; // Ensure userId is available from authMiddleware

  console.log('Received SQL query:', sql); // Debug log
  console.log('User ID:', userId); // Debug log

  if (!sql || typeof sql !== 'string' || !sql.trim()) {
    console.error('Invalid SQL query:', sql); // Debug log
    return res.status(400).json({ success: false, error: 'SQL query is required' });
  }

  try {
    const connection = await connectMySQL();

    // Execute the query
    console.log('Executing query...'); // Debug log
    const [rows, fields] = await connection.query(sql);

    // Save the query to history
    const newHistory = new QueryHistory({ userId, query: sql });
    await newHistory.save();

    // Return the result
    res.status(200).json({
      success: true,
      result: rows.length ? rows : fields, // Return rows or metadata
    });

    await connection.end(); // Close the connection after query
  } catch (err) {
    console.error('❌ SQL Execution Error:', err.message); // Debug log
    res.status(500).json({ success: false, error: err.message });
  }
};

// Save query to history
exports.saveQueryHistory = async (req, res) => {
  const { query } = req.body;
  const userId = req.user.userId;

  try {
    const newHistory = new QueryHistory({ userId, query });
    await newHistory.save();
    res.status(201).json({ success: true, message: 'Query saved to history' });
  } catch (err) {
    console.error('❌ Error saving query history:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save query history' });
  }
};

// Fetch query history
exports.getQueryHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    console.log('Fetching query history for userId:', userId); // Debug log
    const history = await QueryHistory.find({ userId }).sort({ createdAt: -1 });
    console.log('Query history fetched:', history); // Debug log
    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error('❌ Error fetching query history:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch query history' });
  }
};

// Fetch all queries
exports.getAllQueries = async (req, res) => {
  try {
    const history = await QueryHistory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error('❌ Error fetching all queries:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch all queries' });
  }
};

// Clear query history
exports.clearQueryHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    await QueryHistory.deleteMany({ userId });
    res.status(200).json({ success: true, message: 'Query history cleared successfully' });
  } catch (err) {
    console.error('❌ Error clearing query history:', err.message);
    res.status(500).json({ success: false, error: 'Failed to clear query history' });
  }
};

exports.getTableNames = async (req, res) => {
  try {
    const connection = await connectMySQL(); // Ensure MySQL connection is established
    const [tables] = await connection.query("SHOW TABLES"); // Fetch all tables
    const tableNames = tables.map((table) => Object.values(table)[0]); // Extract table names
    res.status(200).json({ success: true, tables: tableNames }); // Return table names
    await connection.end();
  } catch (err) {
    console.error('❌ Error fetching table names:', err.message); // Log error for debugging
    res.status(500).json({ success: false, error: 'Failed to fetch table names' });
  }
};

exports.getTableInfo = async (req, res) => {
  const { tableName } = req.params;
  try {
    const connection = await connectMySQL();
    const [columns] = await connection.query(`DESCRIBE ${tableName}`);
    res.status(200).json({ success: true, columns });
    await connection.end();
  } catch (err) {
    console.error(`❌ Error fetching table info for ${tableName}:`, err.message);
    res.status(500).json({ success: false, error: `Failed to fetch table info for ${tableName}` });
  }
};

exports.dropTable = async (req, res) => {
  const { tableName } = req.params;
  try {
    if (!tableName) {
      return res.status(400).json({ success: false, error: 'Table name is required' });
    }

    const connection = await connectMySQL();
    console.log(`Attempting to drop table: ${tableName}`); // Debug log
    const query = `DROP TABLE IF EXISTS \`${tableName}\``; // Use backticks for table name
    console.log(`Executing query: ${query}`); // Log the query
    await connection.query(query);
    res.status(200).json({ success: true, message: `Table ${tableName} dropped successfully` });
    await connection.end();
  } catch (err) {
    console.error(`❌ Error dropping table ${tableName}:`, err.message); // Debug log
    res.status(500).json({ success: false, error: `Failed to drop table ${tableName}` });
  }
};
