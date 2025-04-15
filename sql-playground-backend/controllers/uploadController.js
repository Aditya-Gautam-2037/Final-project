const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose(); // Add SQLite for database execution

const detectDataType = (values) => {
  if (values.every(v => /^-?\d+$/.test(v))) return 'INTEGER';
  if (values.every(v => /^-?\d+(\.\d+)?$/.test(v))) return 'REAL';
  return 'TEXT';
};

const generateSQL = (data, tableName) => {
  const columns = Object.keys(data[0]);
  const sampleValues = columns.map(col => data.map(row => row[col]));
  const inferredTypes = sampleValues.map(detectDataType);

  const createStmt = `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${columns.map((col, i) => `${col} ${inferredTypes[i]}`).join(',\n  ')}\n);`;

  const insertStmts = data.map(row => {
    const values = columns.map(col => {
      const val = row[col] !== undefined && row[col] !== null ? row[col] : 'NULL'; // Handle undefined or null
      return inferredTypes[columns.indexOf(col)] === 'TEXT' && val !== 'NULL'
        ? `'${val.toString().replace(/'/g, "''")}'`
        : val;
    });
    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
  });

  return [createStmt, ...insertStmts].join('\n');
};

const executeSQL = (dbPath, sqlScript) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to connect to database:', err.message);
      return;
    }
    console.log('✅ Connected to SQLite database');
  });

  db.exec(sqlScript, (err) => {
    if (err) {
      console.error('❌ Error executing SQL:', err.message);
    } else {
      console.log('✅ SQL executed successfully');
    }
  });

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database connection:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
  });
};

const saveQueryToHistory = (dbPath, tableName, sql) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to connect to database for query history:', err.message);
      return;
    }
  });

  const insertHistorySQL = `
    CREATE TABLE IF NOT EXISTS query_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT,
      query TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO query_history (table_name, query) VALUES (?, ?);
  `;

  db.exec(insertHistorySQL, [tableName, sql], (err) => {
    if (err) {
      console.error('❌ Failed to save query to history:', err.message);
    } else {
      console.log('✅ Query saved to history');
    }
  });

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database connection for query history:', err.message);
    }
  });
};

const handleFileUpload = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const uploadsDir = path.join(__dirname, '../uploads');
  const filePath = path.resolve(uploadsDir, req.file.filename); // 🔥 Absolute path
  const ext = path.extname(req.file.originalname).toLowerCase();

  console.log('🗂️ Uploaded file path:', filePath);

  // ✅ CSV FILE HANDLING
  if (ext === '.csv') {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => {
        const defaultTableName = path.basename(req.file.originalname, '.csv').replace(/\W+/g, '_'); // Default table name
        const sqlScript = generateSQL(results, defaultTableName);

        fs.writeFileSync(path.join(uploadsDir, `${defaultTableName}.sql`), sqlScript);

        res.status(200).json({
          success: true,
          message: '✅ File uploaded and SQL generated. Provide a table name to execute the query.',
          filename: req.file.filename,
          defaultTableName,
          sql: sqlScript,
        });
      });

  // 🖼️ IMAGE FILE HANDLING (OCR → CSV → SQL)
  } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const defaultTableName = path.basename(req.file.originalname, ext).replace(/\W+/g, '_'); // Default table name
    const scriptPath = path.resolve(__dirname, 'image_to_sql.py'); // 🔥 Absolute Python script path

    if (!fs.existsSync(filePath)) {
      console.error('❌ Image file not found:', filePath);
      return res.status(500).json({ error: 'Image file not found for OCR' });
    }

    console.log('🐍 Running OCR:', scriptPath, filePath, defaultTableName);

    const py = spawn('python', [scriptPath, filePath, defaultTableName]);

    let pyOutput = '';
    let pyError = '';

    py.stdout.on('data', (data) => pyOutput += data.toString());
    py.stderr.on('data', (data) => pyError += data.toString());

    py.on('close', (code) => {
      console.log('📤 Python Output:\n', pyOutput);
      console.error('🐛 Python Error:\n', pyError);
      console.log('❌ Exit code:', code);
    
      if (code !== 0 || /Traceback|Error/i.test(pyError)) {
        return res.status(500).json({ 
          error: '❌ Failed to process image via OCR',
          stderr: pyError,
          stdout: pyOutput,
          exitCode: code
        });
      }
    
      // Save .sql and respond
      fs.writeFileSync(path.join(uploadsDir, `${defaultTableName}.sql`), pyOutput);

      res.status(200).json({
        success: true,
        message: '📸 Image uploaded and SQL generated. Provide a table name to execute the query.',
        filename: req.file.filename,
        defaultTableName,
        sql: pyOutput,
      });
    });    
  } else {
    res.status(400).json({ error: '❌ Unsupported file type. Only .csv or image files are accepted.' });
  }
};

const executeSQLWithTableName = (req, res) => {
  const { tableName, sql } = req.body;
  if (!tableName || !sql) {
    return res.status(400).json({ error: 'Table name and SQL script are required' });
  }

  const dbPath = path.join(__dirname, '../uploads/database.db'); // Path to SQLite database
  const updatedSQL = sql.replace(/CREATE TABLE IF NOT EXISTS \w+/i, `CREATE TABLE IF NOT EXISTS ${tableName}`);

  executeSQL(dbPath, updatedSQL);

  // Save the executed query to history
  saveQueryToHistory(dbPath, tableName, updatedSQL);

  res.status(200).json({
    success: true,
    message: `✅ SQL executed successfully for table: ${tableName}`,
  });
};

module.exports = { handleFileUpload, executeSQLWithTableName };
