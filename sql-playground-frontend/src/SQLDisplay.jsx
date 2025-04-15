import React, { useState, useEffect } from 'react';

function SQLDisplay({ sql, onQueryInserted }) {
  const [editableSql, setEditableSql] = useState(sql);
  const [isProcessing, setIsProcessing] = useState(false); // Track processing state

  useEffect(() => {
    setEditableSql(sql); // Update editableSql whenever sql prop changes
  }, [sql]);

  const handleCopy = async () => {
    if (!editableSql) {
      alert('No SQL to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(editableSql);
      alert('SQL copied to clipboard.');
    } catch (error) {
      console.error('Error copying SQL:', error);
      alert(`❌ Error copying SQL: ${error.message}`);
    }
  };

  const handleInsert = async () => {
    if (!editableSql) {
      alert('No SQL to insert.');
      return;
    }

    setIsProcessing(true); // Disable interactions during processing

    try {
      // Automatically insert the table into the database
      const response = await fetch('http://localhost:5000/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
        },
        body: JSON.stringify({ sql: editableSql }), // Use the modified SQL
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Table inserted successfully.');
        if (onQueryInserted) {
          onQueryInserted(editableSql); // Notify parent about the new query
        }
      } else {
        alert(`❌ Failed to insert table: ${data.error}`);
      }
    } catch (error) {
      console.error('Error inserting SQL:', error);
      alert(`❌ Error inserting SQL: ${error.message}`);
    } finally {
      setIsProcessing(false); // Re-enable interactions after processing
    }
  };

  return (
    <div className="mt-4">
      <h5>Generated SQL</h5>
      <textarea
        className="bg-dark text-white p-3 rounded w-100"
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          height: editableSql && editableSql.length > 500 ? '400px' : '200px', // Adjust height dynamically
        }}
        value={editableSql || 'SQL will appear here after file upload.'}
        onChange={(e) => setEditableSql(e.target.value)}
        disabled={isProcessing} // Disable editing while processing
      />
      <button
        className="btn btn-primary mt-2"
        onClick={handleCopy}
        disabled={isProcessing} // Disable button while processing
      >
        Copy SQL
      </button>
      <button
        className="btn btn-primary mt-2 ms-2"
        onClick={handleInsert}
        disabled={isProcessing} // Disable button while processing
      >
        {isProcessing ? 'Processing...' : 'Insert Table'}
      </button>
    </div>
  );
}

export default SQLDisplay;
