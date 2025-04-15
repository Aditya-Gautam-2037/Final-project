import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { isTokenExpired } from './utils/isTokenExpired';

// ✅ Token expiry check before rendering app
const token = localStorage.getItem('token');
if (token && isTokenExpired(token)) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login'; // or use navigate if using React Router
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
