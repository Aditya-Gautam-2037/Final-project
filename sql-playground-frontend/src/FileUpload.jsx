import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('');
  const [sql, setSql] = useState('');
  const [defaultTableName, setDefaultTableName] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

   
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSql(response.data.sql);
      setDefaultTableName(response.data.defaultTableName);
      setMessage('File uploaded successfully. Please provide a table name to execute the query.');
    } catch (error) {
      setMessage('Error uploading file: ' + error.response?.data?.error || error.message);

    }
  };

  const handleExecute = async () => {
    if (!tableName) {
      setMessage('Please provide a table name.');
      return;
    }

    try {
      const response = await axios.post('/api/execute-sql', { tableName, sql });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error executing SQL: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>


      {sql || isLoading ? (
        <div>
          <h2>Generated SQL</h2>
          <textarea
            className="bg-dark text-white p-3 rounded w-100"
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              height: '200px',
            }}
            value={sql || 'SQL will appear here after file upload.'}
            readOnly
          />
          <input
            type="text"
            placeholder={`Default: ${defaultTableName}`}
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
          <button onClick={handleExecute}>Execute SQL</button>
        </div>
      ) : null}

      {message && <p>{message}</p>}
    </div>
  );
}

export default FileUpload;
