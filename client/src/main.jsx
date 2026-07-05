import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Intercept fetch calls to dynamically prepend production backend URL if configured
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  let targetUrl = url;
  if (typeof url === 'string' && url.startsWith('/api')) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    targetUrl = `${cleanBaseUrl}${url}`;
  }
  return originalFetch(targetUrl, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
