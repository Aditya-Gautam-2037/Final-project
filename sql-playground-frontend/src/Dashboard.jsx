import React, { useEffect, useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { isTokenExpired } from './utils/isTokenExpired';
import NavbarWithSidebar from './NavbarWithSidebar';
import SQLDisplay from './SQLDisplay';
import { Toast } from 'react-bootstrap';


function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isTableResult, setIsTableResult] = useState(false);
  const [sqlScript, setSqlScript] = useState('');
  const [queryHistory, setQueryHistory] = useState([]); // State for query history
  const [tableNames, setTableNames] = useState([]); // State for table names
  const [selectedTable, setSelectedTable] = useState(''); // State for selected table
  const [queryMessage, setQueryMessage] = useState(''); // State for query execution message
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!savedUser || !token || isTokenExpired(token)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setUser(savedUser);
    }
  }, [navigate]);

  const fetchQueryHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/query-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setQueryHistory(data.history);
      } else {
        console.error('Failed to fetch query history:', data.error);
      }
    } catch (err) {
      console.error('Error fetching query history:', err);
    }
  };

  useEffect(() => {
    fetchQueryHistory(); // Initial fetch
    const intervalId = setInterval(fetchQueryHistory, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const clearQueryHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ You are not logged in. Please log in to clear query history.');
        return;
      }

      const res = await fetch('http://localhost:5000/api/query-history/clear', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('✅ Query history cleared successfully');
        setQueryHistory([]); // Clear the history in the UI
        await fetchQueryHistory(); // Refresh query history after clearing
      } else {
        const data = await res.json();
        alert(`❌ Failed to clear query history: ${data.error}`);
      }
    } catch (err) {
      console.error('Error clearing query history:', err);
      alert('❌ Server error while clearing query history.');
    }
  };

  const handleQuerySubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ You are not logged in. Please log in to execute queries.');
        return;
      }

      const res = await fetch('http://localhost:5000/api/run-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include token
        },
        body: JSON.stringify({ sql: query }), // Send `sql` instead of `query`
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (Array.isArray(data.result) && data.result.length > 0) {
          setIsTableResult(true);
          setResult(data.result);
        } else {
          setIsTableResult(false);
          setResult('✅ Query ran successfully, but no data returned.');
        }
        setQueryMessage('✅ Query executed successfully.'); // Success message

        // Add fade-out effect
        setTimeout(() => {
          const messageElement = document.getElementById('query-message');
          if (messageElement) {
            messageElement.classList.add('fade-out');
          }
          setTimeout(() => setQueryMessage(''), 1000); // Clear message after fade-out
        }, 2000);

        await fetchQueryHistory(); // Fetch query history immediately after successful query execution
      } else {
        setIsTableResult(false);
        setResult({ error: data.error || 'Query failed' });
        setQueryMessage(`❌ Query failed: ${data.error || 'Unknown error'}`); // Failure message
      }
    } catch (err) {
      console.error('Error running query:', err);
      setIsTableResult(false);
      setResult({ error: 'Server error or invalid response' });
      setQueryMessage('❌ Server error while executing query.'); // Server error message
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    setIsProcessing(true);  // Start processing
    setShowToast(true); // Show the toast

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ File uploaded successfully');
        console.log(data);

        if (data.sql) {
          setSqlScript(data.sql);
        }

        // Allow user to enter table name after upload
        if (data.defaultTableName) {
          setSelectedTable(''); // Clear the selected table
          setTableNames([data.defaultTableName]); // Store the default table name for reference
        }
      } else {
        alert(`❌ Upload failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Server error during upload.');
    }finally {
      setIsProcessing(false); // Stop spinner
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
    }
  };

  const handleTableSelection = (e) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);

    // Generate a query for the selected table
    const generatedQuery = `SELECT * FROM ${tableName} LIMIT 10;`;
    setQuery(generatedQuery);
  };

  const handleTableNameChange = (e) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);

    // Replace the table name in the generated SQL script
    if (sqlScript) {
      const updatedSqlScript = sqlScript.replace(/CREATE TABLE IF NOT EXISTS \w+/i, `CREATE TABLE IF NOT EXISTS ${tableName}`);
      setSqlScript(updatedSqlScript);
    }
  };

  const handleConfirmTableName = () => {
    // Replace the table name in both CREATE TABLE and INSERT INTO statements
    if (sqlScript && selectedTable) {
      const updatedSqlScript = sqlScript
        .replace(/CREATE TABLE( IF NOT EXISTS)? \w+/i, `CREATE TABLE IF NOT EXISTS ${selectedTable}`) // Update CREATE TABLE
        .replace(/INSERT INTO \w+/gi, `INSERT INTO ${selectedTable}`); // Update INSERT INTO

      setSqlScript(updatedSqlScript);
      alert(`✅ Table name updated to "${selectedTable}" in the generated query.`);
    } else {
      alert('❌ Please enter a valid table name.');
    }
  };

  return (
    <NavbarWithSidebar>
      <div className="d-flex">
        {/* Dashboard Container */}
        <div className="dashboard-container flex-grow-1">
          <div className="dashboard-header">
            <h1>Welcome to Query Flow</h1>
            <p>Use the SQL Playground to upload files, write queries, and view results.</p>
          </div>

          {/* Upload Section */}
          <div className="dashboard-section">
            <h2>Upload CSV or Image</h2>
            <input
              type="file"
              accept=".csv,image/*"
              className="form-control"
              onChange={handleFileUpload}
            />
            {/* Show toast during processing */}

            {isProcessing && (
                 <Toast
                 show={showToast}
                 onClose={() => setShowToast(false)}
                 style={{
                   position: 'center',
                   top: '20px',
                   right: '20px',
                   zIndex: 9999,
                 }}
               >
                <Toast.Body
                 style={{
                  backgroundColor: '#343a40', // Dark background
                  color: 'white', // Text color
                }}>

            <div className="d-flex align-items-center">
              <strong className="me-2">⏳ Processing file...</strong>
              <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Toast.Body>
          </Toast>
          )}
          </div>

          {/* Table Name Input */}
          {tableNames.length > 0 && (
            <div className="dashboard-section">
              <h2>Enter Table Name</h2>
              <input
                type="text"
                className="form-control"
                placeholder="Enter table name"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              />
              <button
                className="form-control btn btn-primary mt-2"
                onClick={handleConfirmTableName}
              >
                Confirm Table Name
              </button>
            </div>
          )}

          <SQLDisplay
            sql={sqlScript}
            onQueryInserted={(newQuery) => {
              setQueryHistory((prevHistory) => [
                { query: newQuery, createdAt: new Date().toISOString() },
                ...prevHistory,
              ]);
            }}
          />

          {/* SQL Editor */}
          <div className="dashboard-section">
            <h2>SQL Playground</h2>
            <textarea
              className="sql-editor"
              placeholder="-- Write your SQL query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></textarea>
            <button className="btn btn-primary" onClick={handleQuerySubmit}>
              Run Query
            </button>
            {queryMessage && <p id="query-message" className="mt-2">{queryMessage}</p>} {/* Display query message */}
          </div>

          {/* Query Output */}
          <div className="dashboard-section">
            <h2>Query Output</h2>
            {isTableResult && Array.isArray(result) ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover table-sm">
                  <thead className="thead-dark">
                    <tr>
                      {Object.keys(result[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((val, colIndex) => (
                          <td key={colIndex}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="query-output">
                {result ? JSON.stringify(result, null, 2) : 'Results will appear here after running the query.'}
              </pre>
            )}
          </div>
        </div>

        {/* Query History Container */}
        <div className="query-history-container bg-light border-start p-3" style={{ width: '300px' }}>
          <h2>Query History</h2>
          <button className="btn btn-danger mb-3" onClick={clearQueryHistory}>
            Clear History
          </button>
          {queryHistory.length > 0 ? (
            <ul className="query-history-list">
              {queryHistory.map((item) => (
                <li key={item._id || item.createdAt} className="query-history-item">
                  <pre>{item.query}</pre>
                  <small>Executed at: {new Date(item.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No query history available.</p>
          )}
        </div>
      </div>
    </NavbarWithSidebar>
  );
}

export default Dashboard;
