import React, { useState } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');

  const handleGenerateSQL = async () => {
    const selectedQuery = window.getSelection().toString();
    if (!selectedQuery) {
      alert('Please select a query to generate SQL.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: selectedQuery }),
      });
      const data = await response.json();
      setGeneratedSQL(data.generatedSQL);
      setQuery(data.generatedSQL);
    } catch (error) {
      console.error('Error generating SQL:', error);
    }
  };

  return (
    <div className="sql-editor-container">
      <textarea
        className="sql-editor"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Write your SQL query here..."
      />
      {/* Ensure the button is always visible */}
      <button className="generate-sql-button" onClick={handleGenerateSQL}>
        Generate SQL
      </button>
      {generatedSQL && <pre className="query-output">{generatedSQL}</pre>}
    </div>
  );
}

export default App;
